/**
 * §01 §11 — binary content.
 *
 * The rule behind all of it is F-4: every binary endpoint requires the bearer
 * header, so `<img src>` and `<audio src>` cannot be pointed at one. The
 * console had already discovered this the hard way and settled on
 * fetch-as-blob (see `getCallRecordingBlob` and `downloadUsageExport`, whose
 * comment explains why a token in the query string is not the alternative) —
 * but nothing revoked the object URLs afterwards, and a shift's worth of
 * service photos is a real leak (C-16).
 */
import { ApiError } from './errors.js';
import type { HttpClient, RequestSpec } from './http-client.js';

/**
 * Hands out object URLs and remembers them, so a component can drop all of its
 * own in one call on teardown rather than tracking each.
 */
export class ObjectUrlRegistry {
  private readonly urls = new Set<string>();

  create(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  revoke(url: string): void {
    if (!this.urls.delete(url)) return;
    URL.revokeObjectURL(url);
  }

  revokeAll(): void {
    for (const url of this.urls) URL.revokeObjectURL(url);
    this.urls.clear();
  }

  /** How many URLs are outstanding. C-16 asserts this returns to zero. */
  get size(): number {
    return this.urls.size;
  }
}

export interface BinaryResource {
  url: string;
  blob: Blob;
  contentType: string | null;
  filename: string | null;
  /** Idempotent; also removes the URL from the registry that produced it. */
  revoke(): void;
}

export class FileClient {
  /**
   * A registry the client owns, for callers that do not want to manage one.
   * Anything created through it is released by `revokeAll()`.
   */
  readonly urls = new ObjectUrlRegistry();

  constructor(private readonly http: HttpClient) {}

  /** Downloads to a Blob, with the response's own content type and filename. */
  async download(spec: Omit<RequestSpec, 'responseType'>): Promise<Omit<BinaryResource, 'url' | 'revoke'>> {
    const response = await this.http.request<Blob>({ ...spec, responseType: 'blob' });
    return {
      blob: response.data,
      contentType: response.headers.get('content-type'),
      filename: filenameFromContentDisposition(response.headers.get('content-disposition')),
    };
  }

  /**
   * §01 F-4 — the `<img>`/`<audio>` substitute. The caller MUST call `revoke()`
   * when the element goes away; `urls.revokeAll()` is the blunt instrument for
   * a whole screen.
   */
  async objectUrlFor(spec: Omit<RequestSpec, 'responseType'>): Promise<BinaryResource> {
    const file = await this.download(spec);
    const url = this.urls.create(file.blob);
    return {
      ...file,
      url,
      revoke: () => this.urls.revoke(url),
    };
  }

  /**
   * §01 F-3 — the streaming form. `GetCallRecording` can be long, and buffering
   * one into memory per tab on a 60-tab operator workstation is not acceptable.
   */
  async stream(spec: Omit<RequestSpec, 'responseType'>): Promise<ReadableStream<Uint8Array>> {
    const response = await this.http.request<ReadableStream<Uint8Array> | null>({ ...spec, responseType: 'stream' });
    if (!response.data) {
      throw new ApiError('The response carried no body to stream', {
        status: response.status,
        problem: { status: response.status, code: 'CLIENT.NO_STREAM', title: 'No response body' },
        ...(spec.operationId ? { operationId: spec.operationId } : {}),
      });
    }
    return response.data;
  }

  /**
   * §01 F-1 / F-2 — a multipart upload with progress.
   *
   * No `Content-Type` is set for the part: the server detects it from magic
   * bytes (`ContentTypeDetector`), and a client-supplied type that disagrees
   * produces a file the UI labels one way and the store labels another.
   */
  upload<T>(options: {
    path: string;
    file: Blob;
    filename?: string;
    field?: string;
    fields?: Record<string, string | Blob>;
    method?: 'POST' | 'PUT';
    query?: RequestSpec['query'];
    onProgress?: (progress: { loaded: number; total?: number; ratio?: number }) => void;
    signal?: AbortSignal;
    operationId?: string;
  }): Promise<T> {
    const form = new FormData();
    for (const [key, value] of Object.entries(options.fields ?? {})) form.append(key, value);
    if (options.filename) form.append(options.field ?? 'file', options.file, options.filename);
    else form.append(options.field ?? 'file', options.file);

    return this.http.json<T>({
      method: options.method ?? 'POST',
      path: options.path,
      body: form,
      ...(options.query ? { query: options.query } : {}),
      ...(options.onProgress ? { onUploadProgress: options.onProgress } : {}),
      ...(options.signal ? { signal: options.signal } : {}),
      ...(options.operationId ? { operationId: options.operationId } : {}),
      // An upload is a POST with a body the server may already have consumed;
      // §01 RT-2 forbids replaying it.
      retry: false,
    });
  }
}

/** `attachment; filename="rapor.xlsx"; filename*=UTF-8''rapor.xlsx` → `rapor.xlsx`. */
export function filenameFromContentDisposition(header: string | null | undefined): string | null {
  if (!header) return null;
  // RFC 5987 first: it is the one that survives non-ASCII names.
  const extended = /filename\*\s*=\s*([^']*)'[^']*'([^;]+)/i.exec(header);
  if (extended?.[2]) {
    try {
      return decodeURIComponent(extended[2].trim());
    } catch {
      return extended[2].trim();
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/i.exec(header);
  return plain?.[1]?.trim() ?? null;
}

/**
 * Saves a Blob under a filename. The browser-only half of the download story
 * the console repeated at every export button.
 */
export function saveBlob(blob: Blob, filename: string): void {
  const doc = (globalThis as { document?: Document }).document;
  if (!doc) throw new Error('saveBlob requires a DOM');
  const url = URL.createObjectURL(blob);
  try {
    const anchor = doc.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    doc.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    // Revoked on the next turn: revoking synchronously races the navigation
    // the click just started, and Safari then downloads a zero-byte file.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
