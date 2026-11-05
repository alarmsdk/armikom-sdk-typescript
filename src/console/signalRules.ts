import type { ReferenceDataApi } from '../../generated/index.js'
import type { SignalRulesClient } from './types.js'

/**
 * The `signalRules` section of the client: a thin, typed layer over the generated
 * `ReferenceDataApi`. Kept out of `useArmikomClient.ts` so the screen's whole API surface
 * reads in one place.
 */
export function createSignalRulesClient(api: ReferenceDataApi): SignalRulesClient {
  return {
    list: async (monitoringCenterId) => (await api.listSignalRules({ monitoringCenterId })) || [],
    get: async (id, monitoringCenterId) => await api.getSignalRuleById({ id, monitoringCenterId }),
    catalog: async (monitoringCenterId) => await api.getSignalRuleCatalog({ monitoringCenterId }),
    validate: async (request, monitoringCenterId) =>
      await api.validateSignalRule({ signalRuleWriteRequest: request, monitoringCenterId }),
    create: async (request, monitoringCenterId) =>
      await api.createSignalRule({ signalRuleWriteRequest: request, monitoringCenterId }),
    update: async (id, request, monitoringCenterId) =>
      await api.updateSignalRule({ id, signalRuleWriteRequest: request, monitoringCenterId }),
    remove: async (id, monitoringCenterId) => {
      await api.deleteSignalRule({ id, monitoringCenterId })
    }
  }
}
