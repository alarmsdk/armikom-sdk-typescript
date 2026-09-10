/**
 * The transport seam. Everything above it (auth, retry, deadline, errors) is in
 * `client.ts`; everything below it is one function that turns a request into a
 * `Response`, which is what makes the whole pipeline testable without a socket
 * (§01 B-1: `transport` is injectable).
 */
import type { HttpMethod } from './retry.js';

export type QueryValue = string | number | boolean | Date | null | undefined;
export type QueryParams = Record<string, QueryValue | readonly QueryValue[]>;

export interface Progress {
  loaded: number;
  /** Absent when the body length is unknown (a stream, chunked encoding). */
  total?: number;
  /** 0..1, absent when `total` is. */
  ratio?: number;
}

export interface TransportRequest {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: BodyInit | null;
  signal?: AbortSignal;
  /** Only honoured by transports that can report it; `fetch` cannot. */
  onUploadProgress?: (progress: Progress) => void;
  credentials?: RequestCredentials;
}

export type Transport = (request: TransportRequest) => Promise<Response>;

export const fetchTransport: Transport = (request) => {
  const init: RequestInit = {
    method: request.method,
    headers: request.headers,
    ...(request.body !== undefined ? { body: request.body } : {}),
    ...(request.signal ? { signal: request.signal } : {}),
    ...(request.credentials ? { credentials: request.credentials } : {}),
  };
  return fetch(request.url, init);
};

/**
 * §01 F-1 — uploads must expose progress, and `fetch` still cannot report it.
 * Used only when a caller asks for progress; everything else goes through
 * `fetch`, which streams and handles abort properly.
 */
export const xhrTransport: Transport = (request) =>
  new Promise<Response>((resolve, reject) => {
    const XHR = (globalThis as { XMLHttpRequest?: typeof XMLHttpRequest }).XMLHttpRequest;
    if (!XHR) {
      reject(new Error('XMLHttpRequest is not available; upload progress needs a browser transport'));
      return;
    }
    const xhr = new XHR();
    xhr.open(request.method, request.url, true);
    xhr.responseType = 'blob';
    for (const [key, value] of Object.entries(request.headers)) {
      // The browser sets these itself and rejects the attempt.
      if (/^(content-length|host|connection)$/i.test(key)) continue;
      xhr.setRequestHeader(key, value);
    }
    if (request.onUploadProgress) {
      xhr.upload.onprogress = (e) =>
        request.onUploadProgress?.({
          loaded: e.loaded,
          ...(e.lengthComputable ? { total: e.total, ratio: e.total > 0 ? e.loaded / e.total : 0 } : {}),
        });
    }
    xhr.onload = () => {
      const headers = parseXhrHeaders(xhr.getAllResponseHeaders());
      // 204/205 must not carry a body, and `new Response(body, {status:204})` throws.
      const body = xhr.status === 204 || xhr.status === 205 ? null : (xhr.response as Blob | null);
      resolve(new Response(body, { status: xhr.status, statusText: xhr.statusText, headers }));
    };
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'));
    xhr.onabort = () => reject(abortReason(request.signal));
    request.signal?.addEventListener('abort', () => xhr.abort(), { once: true });
    xhr.send((request.body ?? null) as XMLHttpRequestBodyInit | null);
  });

function abortReason(signal: AbortSignal | undefined): unknown {
  const reason = signal?.reason;
  if (reason) return reason;
  const err = new Error('The request was aborted');
  err.name = 'AbortError';
  return err;
}

function parseXhrHeaders(raw: string): Headers {
  const headers = new Headers();
  for (const line of raw.trim().split(/[\r\n]+/)) {
    const index = line.indexOf(':');
    if (index <= 0) continue;
    try {
      headers.append(line.slice(0, index).trim(), line.slice(index + 1).trim());
    } catch {
      // A header the Headers guard rejects is not worth failing the response over.
    }
  }
  return headers;
}

/**
 * Serialises query parameters.
 *
 * Arrays repeat the key (`?id=1&id=2`) — the form ASP.NET model binding reads.
 * `undefined` and `null` are dropped entirely: `?state=` is a filter for the
 * empty string, not the absence of a filter, and the two have produced
 * different result sets often enough to be worth a comment.
 */
export function buildQuery(params: QueryParams | undefined): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const values = Array.isArray(value) ? value : [value as QueryValue];
    for (const item of values) {
      if (item === undefined || item === null) continue;
      search.append(key, item instanceof Date ? item.toISOString() : String(item));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

export function joinUrl(baseUrl: string, path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) return path;
  if (!baseUrl) return path;
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/**
 * One signal that fires when any of its inputs does, with the first reason
 * preserved — a deadline and a caller cancellation have to be distinguishable.
 */
export function combineSignals(signals: ReadonlyArray<AbortSignal | undefined>): {
  signal: AbortSignal;
  dispose: () => void;
} {
  const controller = new AbortController();
  const live = signals.filter((s): s is AbortSignal => !!s);
  const cleanups: Array<() => void> = [];
  for (const signal of live) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    const onAbort = () => controller.abort(signal.reason);
    signal.addEventListener('abort', onAbort, { once: true });
    cleanups.push(() => signal.removeEventListener('abort', onAbort));
  }
  return {
    signal: controller.signal,
    dispose: () => {
      for (const c of cleanups) c();
    },
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError');
}
