import type { BinaryContent } from './files.js'

/**
 * S-620 / S-621 · report assistant and saved reports. Mirrors `Armikom.Api.Contracts.Reports`;
 * kept local so the screens type-check against the shape they render, not the generator's
 * nullable-everything models.
 */

export type ReportParameterType =
  | 'text'
  | 'int'
  | 'decimal'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'enum'
  | 'lookup'

export type ReportLookupSource =
  | 'dealers'
  | 'monitoring-centers'
  | 'signal-types'
  | 'alarm-categories'
  | 'receivers'
  | 'sides'
  | 'customers'

export interface ReportParameter {
  name: string
  label?: string | null
  type: ReportParameterType | string
  required?: boolean
  multi?: boolean
  /** Literal or relative token: today, today-7d, last_7_days, last_month… */
  default?: string | null
  options?: Array<{ value: string; label?: string | null }> | null
  source?: ReportLookupSource | string | null
  description?: string | null
}

/**
 * Report SQL never reaches the browser (S-620 / S-621): the API strips it for every user and these
 * types have no field for it. Do not add one back.
 */
export interface ReportSheet {
  name: string
  maxRows?: number
  columns?: Array<{ key: string; label?: string | null }> | null
}

export interface ReportDefinitionBody {
  title: string
  description?: string | null
  parameters: ReportParameter[]
  sheets: ReportSheet[]
}

export interface ReportDefinition {
  id: string
  title: string
  description?: string | null
  visibility: 'private' | 'shared' | string
  tenantAware: boolean
  ownerId: string
  ownerName?: string | null
  isOwner: boolean
  canManage: boolean
  version: number
  createdAt: Date | string
  updatedAt: Date | string
  definition: ReportDefinitionBody
}

export interface ReportColumn {
  name: string
  label?: string | null
  /** text · number · bool · date · datetime (dates arrive as local-time strings). */
  type: string
}

export interface ReportSheetResult {
  name: string
  columns: ReportColumn[]
  rows: unknown[][]
  rowCount: number
  truncated: boolean
  error?: string | null
  elapsedMs?: number
}

export interface ReportRunResult {
  sheets: ReportSheetResult[]
  resolvedParameters: Record<string, unknown>
  warnings: string[]
}

/** A daterange value: local calendar days, inclusive, or a relative token. */
export type ReportParameterValue =
  | string
  | number
  | boolean
  | string[]
  | { from: string; to: string }
  | null

export type ReportParameterValues = Record<string, ReportParameterValue>

export interface ReportPreviewCard {
  previewId: string
  title: string
  parameters: ReportParameter[]
  values: Record<string, unknown>
  resolvedParameters: Record<string, unknown>
  columns: ReportColumn[]
  rows: unknown[][]
  rowCount: number
  truncated: boolean
  errors: string[]
  warnings: string[]
}

export interface ReportProposalCard {
  proposalId: string
  definition: ReportDefinitionBody
  tenantAware: boolean
  warnings: string[]
  resolvedDefaults: Record<string, unknown>
  sample: ReportSheetResult[]
  savedReportId?: string | null
}

export interface ReportAgentMessage {
  seq: number
  role: 'user' | 'assistant' | string
  /** text · step · preview · proposal · error */
  kind: string
  text?: string | null
  preview?: ReportPreviewCard | null
  proposal?: ReportProposalCard | null
  createdAt: Date | string
}

export type ReportAgentStatus = 'idle' | 'running' | 'failed'

export interface ReportAgentSessionSummary {
  id: string
  title: string
  status: ReportAgentStatus | string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface ReportAgentSession extends ReportAgentSessionSummary {
  error?: string | null
  lastSeq: number
  messages: ReportAgentMessage[]
}

export interface ReportsClient {
  listDefinitions: () => Promise<ReportDefinition[]>
  getDefinition: (id: string) => Promise<ReportDefinition>
  updateDefinition: (
    id: string,
    request: { title?: string; description?: string | null; visibility?: string }
  ) => Promise<ReportDefinition>
  deleteDefinition: (id: string) => Promise<void>
  run: (id: string, values: ReportParameterValues) => Promise<ReportRunResult>
  exportExcel: (id: string, values: ReportParameterValues) => Promise<BinaryContent>
  assistant: {
    listSessions: () => Promise<ReportAgentSessionSummary[]>
    createSession: (text?: string) => Promise<ReportAgentSession>
    /** With `afterSeq`, only messages newer than that sequence number. */
    getSession: (id: string, afterSeq?: number) => Promise<ReportAgentSession>
    send: (id: string, text: string) => Promise<ReportAgentSession>
    deleteSession: (id: string) => Promise<void>
    exportPreview: (sessionId: string, previewId: string) => Promise<BinaryContent>
    saveProposal: (
      sessionId: string,
      proposalId: string,
      request: { title?: string; description?: string | null; visibility?: string }
    ) => Promise<ReportDefinition>
  }
}
