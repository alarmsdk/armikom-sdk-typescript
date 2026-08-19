
# ClosingDelayResponse


## Properties

Name | Type
------------ | -------------
`closingDelayId` | string
`closingDateUtc` | Date
`mode` | string
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { ClosingDelayResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "closingDelayId": null,
  "closingDateUtc": null,
  "mode": null,
  "sideEffects": null,
} satisfies ClosingDelayResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClosingDelayResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


