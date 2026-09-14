
# OperatorCallSummaryResponse

Per-operator call summary for a time window.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`items` | [Array&lt;OperatorCallSummaryItem&gt;](OperatorCallSummaryItem.md)

## Example

```typescript
import type { OperatorCallSummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "items": null,
} satisfies OperatorCallSummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorCallSummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


