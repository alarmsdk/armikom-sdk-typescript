
# ResponseTimeAggregates


## Properties

Name | Type
------------ | -------------
`signalCount` | number
`avgQueueToViewSeconds` | number
`avgQueueToLockSeconds` | number
`avgQueueToCompleteSeconds` | number
`p50QueueToCompleteSeconds` | number
`p95QueueToCompleteSeconds` | number

## Example

```typescript
import type { ResponseTimeAggregates } from ''

// TODO: Update the object below with actual values
const example = {
  "signalCount": null,
  "avgQueueToViewSeconds": null,
  "avgQueueToLockSeconds": null,
  "avgQueueToCompleteSeconds": null,
  "p50QueueToCompleteSeconds": null,
  "p95QueueToCompleteSeconds": null,
} satisfies ResponseTimeAggregates

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ResponseTimeAggregates
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


