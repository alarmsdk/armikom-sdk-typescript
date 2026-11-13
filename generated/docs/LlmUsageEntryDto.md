
# LlmUsageEntryDto


## Properties

Name | Type
------------ | -------------
`day` | string
`task` | string
`model` | string
`requests` | number
`inputTokens` | number
`outputTokens` | number
`cost` | number

## Example

```typescript
import type { LlmUsageEntryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "day": null,
  "task": null,
  "model": null,
  "requests": null,
  "inputTokens": null,
  "outputTokens": null,
  "cost": null,
} satisfies LlmUsageEntryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LlmUsageEntryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


