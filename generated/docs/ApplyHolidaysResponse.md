
# ApplyHolidaysResponse


## Properties

Name | Type
------------ | -------------
`applied` | number
`skipped` | number
`skippedReasons` | [Array&lt;ApplySkippedReason&gt;](ApplySkippedReason.md)
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { ApplyHolidaysResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "applied": null,
  "skipped": null,
  "skippedReasons": null,
  "sideEffects": null,
} satisfies ApplyHolidaysResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApplyHolidaysResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


