import type { ReportAssistantApi, ReportsApi } from '../../generated/index.js'
import { toBinaryContent } from './binary.js'
import type {
  ReportAgentMessage,
  ReportAgentSession,
  ReportAgentSessionSummary,
  ReportDefinition,
  ReportDefinitionBody,
  ReportParameterValues,
  ReportRunResult,
  ReportsClient
} from '../domain/types/reports.js'


/**
 * The `reports` section of the client (S-620 assistant, S-621 saved reports): a thin layer
 * over the generated `ReportsApi` / `ReportAssistantApi`. The assistant works server-side in
 * the background; the console polls `getSession(id, afterSeq)` while `status` is `running`.
 */
export function createReportsClient(reports: ReportsApi, assistant: ReportAssistantApi): ReportsClient {
  return {
    listDefinitions: async () => ((await reports.listReportDefinitions()) || []) as ReportDefinition[],
    getDefinition: async (id) => (await reports.getReportDefinition({ id })) as ReportDefinition,
    updateDefinition: async (id, request) =>
      (await reports.updateReportDefinition({ id, updateReportDefinitionRequest: request })) as ReportDefinition,
    deleteDefinition: async (id) => {
      await reports.deleteReportDefinition({ id })
    },
    run: async (id, values) =>
      (await reports.runReportDefinition({ id, runReportRequest: { values } })) as unknown as ReportRunResult,
    exportExcel: async (id, values) => {
      const resp = await reports.exportReportDefinitionRaw({ id, runReportRequest: { values } })
      return toBinaryContent(resp.raw, 'rapor.xlsx')
    },
    assistant: {
      listSessions: async () =>
        ((await assistant.listReportAgentSessions()) || []) as ReportAgentSessionSummary[],
      createSession: async (text) =>
        (await assistant.createReportAgentSession({
          createReportAgentSessionRequest: { text: text ?? null }
        })) as unknown as ReportAgentSession,
      getSession: async (id, afterSeq) =>
        (await assistant.getReportAgentSession({ id, afterSeq })) as unknown as ReportAgentSession,
      send: async (id, text) =>
        (await assistant.sendReportAgentMessage({
          id,
          sendReportAgentMessageRequest: { text }
        })) as unknown as ReportAgentSession,
      deleteSession: async (id) => {
        await assistant.deleteReportAgentSession({ id })
      },
      exportPreview: async (sessionId, previewId) => {
        const resp = await assistant.exportReportAgentPreviewRaw({ id: sessionId, previewId })
        return toBinaryContent(resp.raw, 'onizleme.xlsx')
      },
      saveProposal: async (sessionId, proposalId, request) =>
        (await assistant.saveReportAgentProposal({
          id: sessionId,
          proposalId,
          saveReportProposalRequest: request
        })) as ReportDefinition
    }
  }
}
