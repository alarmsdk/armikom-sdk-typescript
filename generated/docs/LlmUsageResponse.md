
# LlmUsageResponse

AI usage per day, task and model.

## Properties

Name | Type
------------ | -------------
`from` | string
`to` | string
`currency` | string
`totalCost` | number
`entries` | [Array&lt;LlmUsageEntryDto&gt;](LlmUsageEntryDto.md)

## Example

```typescript
import type { LlmUsageResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "currency": null,
  "totalCost": null,
  "entries": null,
} satisfies LlmUsageResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LlmUsageResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


