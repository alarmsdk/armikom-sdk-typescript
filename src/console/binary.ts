/**
 * The binary download path (§01 §11), as the console facade exposes it.
 *
 * Every generated binary operation is `Promise<void>`: the convenience method throws the body
 * away, and only the `*Raw` variant hands back the `Response`. This turns that response into
 * the console's `BinaryContent`, with the filename from `Content-Disposition` (RFC 5987 first,
 * for Turkish names) and the content type the server detected from magic bytes (§01 F-2).
 */
import { filenameFromContentDisposition, safeFilename } from '../core/files.js'
import type { BinaryContent } from '../domain/types/files.js'

export async function toBinaryContent(res: Response, fallbackName: string): Promise<BinaryContent> {
  const blob = await res.blob()
  const fromHeader = filenameFromContentDisposition(res.headers.get('Content-Disposition'))
  return {
    blob,
    filename: safeFilename(fromHeader || fallbackName, fallbackName),
    // The server detects the type from magic bytes (§01 F-2); trust it over the blob's.
    contentType: res.headers.get('Content-Type') || blob.type || 'application/octet-stream'
  }
}
