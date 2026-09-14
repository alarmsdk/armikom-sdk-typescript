
# OperatorDataEntrySummaryResponse

Per-operator data-entry summary.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`items` | [Array&lt;OperatorDataEntryItem&gt;](OperatorDataEntryItem.md)

## Example

```typescript
import type { OperatorDataEntrySummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "items": null,
} satisfies OperatorDataEntrySummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorDataEntrySummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


