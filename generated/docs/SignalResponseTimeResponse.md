
# SignalResponseTimeResponse

Per-signal time chain: queued → viewed → locked → completed.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`aggregates` | [ResponseTimeAggregates](ResponseTimeAggregates.md)
`items` | [Array&lt;SignalResponseTimeItem&gt;](SignalResponseTimeItem.md)
`totalCount` | number

## Example

```typescript
import type { SignalResponseTimeResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "aggregates": null,
  "items": null,
  "totalCount": null,
} satisfies SignalResponseTimeResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalResponseTimeResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


