
# ReportAgentMessageDto

One entry of the conversation as the console renders it.

## Properties

Name | Type
------------ | -------------
`seq` | number
`role` | string
`kind` | string
`text` | string
`preview` | [ReportPreviewCardDto](ReportPreviewCardDto.md)
`proposal` | [ReportProposalCardDto](ReportProposalCardDto.md)
`createdAt` | Date

## Example

```typescript
import type { ReportAgentMessageDto } from ''

// TODO: Update the object below with actual values
const example = {
  "seq": null,
  "role": null,
  "kind": null,
  "text": null,
  "preview": null,
  "proposal": null,
  "createdAt": null,
} satisfies ReportAgentMessageDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportAgentMessageDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


