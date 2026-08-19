
# SignalBlockResponse


## Properties

Name | Type
------------ | -------------
`signalBlockId` | string
`durationMinutes` | number
`endDateUtc` | Date
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SignalBlockResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "signalBlockId": null,
  "durationMinutes": null,
  "endDateUtc": null,
  "sideEffects": null,
} satisfies SignalBlockResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalBlockResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


