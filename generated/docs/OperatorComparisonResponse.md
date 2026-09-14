
# OperatorComparisonResponse

Combined operator comparison — all metrics in one response.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`items` | [Array&lt;OperatorComparisonItem&gt;](OperatorComparisonItem.md)

## Example

```typescript
import type { OperatorComparisonResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "items": null,
} satisfies OperatorComparisonResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorComparisonResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


