
# AdvisoryDto

One advisory run for a signal event: the AI summary, and the notes that attach to operator actions.

## Properties

Name | Type
------------ | -------------
`id` | string
`status` | string
`summary` | string
`relationName` | string
`requestedAt` | Date
`completedAt` | Date
`skipReason` | string
`notes` | [Array&lt;AdvisoryNoteDto&gt;](AdvisoryNoteDto.md)

## Example

```typescript
import type { AdvisoryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "status": null,
  "summary": null,
  "relationName": null,
  "requestedAt": null,
  "completedAt": null,
  "skipReason": null,
  "notes": null,
} satisfies AdvisoryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdvisoryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


