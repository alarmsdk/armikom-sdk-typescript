
# BulkSendSmsResponse

Result of a bulk SMS operation — per-subscriber reporting, same pattern as SideBatchUpdateResponse.

## Properties

Name | Type
------------ | -------------
`requestedCount` | number
`queuedCount` | number
`successCount` | number
`failedCount` | number
`isCapped` | boolean
`failures` | [Array&lt;BulkSmsFailure&gt;](BulkSmsFailure.md)
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { BulkSendSmsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "requestedCount": null,
  "queuedCount": null,
  "successCount": null,
  "failedCount": null,
  "isCapped": null,
  "failures": null,
  "sideEffects": null,
} satisfies BulkSendSmsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BulkSendSmsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


