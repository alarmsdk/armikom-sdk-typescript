
# CutoverHealthResponse


## Properties

Name | Type
------------ | -------------
`timestampUtc` | Date
`windowStart` | Date
`sms` | [SmsMetrics](SmsMetrics.md)
`email` | [EmailMetrics](EmailMetrics.md)
`push` | [PushMetrics](PushMetrics.md)
`systemSignals24h` | number
`overall` | string

## Example

```typescript
import type { CutoverHealthResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "timestampUtc": null,
  "windowStart": null,
  "sms": null,
  "email": null,
  "push": null,
  "systemSignals24h": null,
  "overall": null,
} satisfies CutoverHealthResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CutoverHealthResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


