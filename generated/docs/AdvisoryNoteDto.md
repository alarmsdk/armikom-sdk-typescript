
# AdvisoryNoteDto

One note, bound to one operator action.

## Properties

Name | Type
------------ | -------------
`id` | string
`hook` | string
`effect` | string
`severity` | number
`title` | string
`message` | string
`targetRef` | string
`evidence` | string

## Example

```typescript
import type { AdvisoryNoteDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "hook": null,
  "effect": null,
  "severity": null,
  "title": null,
  "message": null,
  "targetRef": null,
  "evidence": null,
} satisfies AdvisoryNoteDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdvisoryNoteDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


