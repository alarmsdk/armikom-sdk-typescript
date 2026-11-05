/**
 * The five id-addressable binary downloads (§01 §11). `ExportSignalEvents` is the
 * sixth binary operation but takes a filter body rather than an id, so it has its own
 * entry point on the client facade.
 */
export type BinaryOperation =
  | 'GetSideDocumentContent'
  | 'GetServicePhotoContent'
  | 'GetCallRecording'
  | 'GetDealerLogo'
  | 'GetMonitoringCenterAlarmSound'

export interface BinaryContent {
  blob: Blob
  /** From `Content-Disposition`, falling back to a name derived from the operation. */
  filename: string
  /**
   * From `Content-Type`. The server detects this from magic bytes, not from anything
   * the client sent (§01 F-2), so it is the only trustworthy answer.
   */
  contentType: string
}

export interface SignalExportOptions {
  query?: string
  from?: Date
  to?: Date
  sort?: string
  format?: string
  /** Chosen by the operator, never inferred from the browser (V6). */
  timeZone: string
}

export interface SideExportOptions {
  query?: string
  active?: boolean
  approved?: boolean
  dealerId?: string
  sort?: string
  format?: string
  /** Chosen by the operator, never inferred from the browser (V6). */
  timeZone: string
  /** Advanced filters forwarded verbatim so the export matches the screen. */
  advanced?: Record<string, unknown>
}

/** AR-29 · who switched which subscriber active or passive, when and why. */
export interface SideStatusHistoryExportOptions {
  from?: Date
  to?: Date
  dealerId?: string
  format?: 'csv' | 'xlsx'
  /** Chosen by the operator, never inferred from the browser (V6). */
  timeZone: string
}

/**
 * AR-16 · the alarm batch screen's selection as a bulk-SMS target. The server resolves
 * it to the distinct subscribers with an open alarm of those codes, so the operator's
 * view and the recipients cannot drift apart.
 */
export interface BulkSmsAlarmTargetOptions {
  signalCodes: string[]
  brandId?: string
  modelId?: string
  dealerId?: string
  /** Only alarms that existed when the screen loaded its candidates. */
  cutoffUtc?: Date
}
