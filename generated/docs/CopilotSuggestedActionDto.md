
# CopilotSuggestedActionDto

Something for the operator to know, to write, or to do. A proposal is never a command:  an Armikom.Api.Contracts.Copilot.CopilotSuggestedActionDto.Operation only tells the console which dialog to open pre-filled.

## Properties

Name | Type
------------ | -------------
`id` | string
`kind` | string
`actionType` | string
`title` | string
`detail` | string
`confidence` | number
`source` | string
`phase` | string
`operation` | [CopilotProposedOperationDto](CopilotProposedOperationDto.md)
`createdAt` | Date

## Example

```typescript
import type { CopilotSuggestedActionDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "kind": null,
  "actionType": null,
  "title": null,
  "detail": null,
  "confidence": null,
  "source": null,
  "phase": null,
  "operation": null,
  "createdAt": null,
} satisfies CopilotSuggestedActionDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotSuggestedActionDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


