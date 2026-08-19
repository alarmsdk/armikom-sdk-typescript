
# EmailMetrics


## Properties

Name | Type
------------ | -------------
`queued24h` | number
`sent24h` | number
`failedPermanently` | number

## Example

```typescript
import type { EmailMetrics } from ''

// TODO: Update the object below with actual values
const example = {
  "queued24h": null,
  "sent24h": null,
  "failedPermanently": null,
} satisfies EmailMetrics

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EmailMetrics
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


