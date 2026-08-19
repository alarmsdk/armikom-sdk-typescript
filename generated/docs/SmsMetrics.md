
# SmsMetrics


## Properties

Name | Type
------------ | -------------
`sent24h` | number
`unsent` | number
`baselineDaily` | string
`status` | string

## Example

```typescript
import type { SmsMetrics } from ''

// TODO: Update the object below with actual values
const example = {
  "sent24h": null,
  "unsent": null,
  "baselineDaily": null,
  "status": null,
} satisfies SmsMetrics

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SmsMetrics
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


