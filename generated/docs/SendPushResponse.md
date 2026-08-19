
# SendPushResponse


## Properties

Name | Type
------------ | -------------
`queuedCount` | number
`devices` | [Array&lt;PushDeviceInfo&gt;](PushDeviceInfo.md)
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SendPushResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "queuedCount": null,
  "devices": null,
  "sideEffects": null,
} satisfies SendPushResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SendPushResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


