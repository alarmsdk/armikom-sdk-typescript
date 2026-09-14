
# OperatorSignalSummaryResponse

Per-operator alarm handling summary for a time window.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`items` | [Array&lt;OperatorSignalSummaryItem&gt;](OperatorSignalSummaryItem.md)

## Example

```typescript
import type { OperatorSignalSummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "items": null,
} satisfies OperatorSignalSummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorSignalSummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


