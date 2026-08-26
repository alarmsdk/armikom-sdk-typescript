
# CopilotConversationEventDto

One event. Armikom.Api.Contracts.Copilot.CopilotConversationEventDto.Kind selects which of the three optional payloads is populated;  the other two are absent.

## Properties

Name | Type
------------ | -------------
`kind` | string
`callId` | string
`operatorExtension` | string
`signalEventId` | string
`customerNumber` | string
`callerIsOperator` | boolean
`startedAt` | Date
`endedAt` | Date
`status` | string
`segment` | [CopilotSegmentDto](CopilotSegmentDto.md)
`action` | [CopilotSuggestedActionDto](CopilotSuggestedActionDto.md)
`summary` | [CopilotSummaryDto](CopilotSummaryDto.md)

## Example

```typescript
import type { CopilotConversationEventDto } from ''

// TODO: Update the object below with actual values
const example = {
  "kind": null,
  "callId": null,
  "operatorExtension": null,
  "signalEventId": null,
  "customerNumber": null,
  "callerIsOperator": null,
  "startedAt": null,
  "endedAt": null,
  "status": null,
  "segment": null,
  "action": null,
  "summary": null,
} satisfies CopilotConversationEventDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotConversationEventDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


