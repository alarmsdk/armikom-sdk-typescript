
# SignalDelayResponse


## Properties

Name | Type
------------ | -------------
`waitingEventId` | string
`durationMinutes` | number
`delayUntilUtc` | Date
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SignalDelayResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "waitingEventId": null,
  "durationMinutes": null,
  "delayUntilUtc": null,
  "sideEffects": null,
} satisfies SignalDelayResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalDelayResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


