
# SideBatchUpdateResponse

What a batch update actually did. Never a bare count: a batch where nine of four hundred rows were refused has to name those nine, or the operator\'s next move is to run the whole thing again.

## Properties

Name | Type
------------ | -------------
`requestedCount` | number
`updatedCount` | number
`skippedCount` | number
`isCapped` | boolean
`failures` | [Array&lt;SideBatchUpdateFailure&gt;](SideBatchUpdateFailure.md)
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SideBatchUpdateResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "requestedCount": null,
  "updatedCount": null,
  "skippedCount": null,
  "isCapped": null,
  "failures": null,
  "sideEffects": null,
} satisfies SideBatchUpdateResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideBatchUpdateResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


