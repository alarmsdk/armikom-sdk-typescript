
# LlmPromptDto


## Properties

Name | Type
------------ | -------------
`key` | string
`task` | string
`text` | string
`defaultText` | string
`maxLength` | number
`updatedAt` | Date
`updatedBy` | string

## Example

```typescript
import type { LlmPromptDto } from ''

// TODO: Update the object below with actual values
const example = {
  "key": null,
  "task": null,
  "text": null,
  "defaultText": null,
  "maxLength": null,
  "updatedAt": null,
  "updatedBy": null,
} satisfies LlmPromptDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LlmPromptDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


