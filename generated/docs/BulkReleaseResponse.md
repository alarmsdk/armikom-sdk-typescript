
# BulkReleaseResponse


## Properties

Name | Type
------------ | -------------
`releasedCount` | number
`requestedCount` | number
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { BulkReleaseResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "releasedCount": null,
  "requestedCount": null,
  "sideEffects": null,
} satisfies BulkReleaseResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BulkReleaseResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


