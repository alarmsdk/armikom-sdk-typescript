
# GeocodeCandidate


## Properties

Name | Type
------------ | -------------
`formattedAddress` | string
`latitude` | string
`longitude` | string
`confidence` | number

## Example

```typescript
import type { GeocodeCandidate } from ''

// TODO: Update the object below with actual values
const example = {
  "formattedAddress": null,
  "latitude": null,
  "longitude": null,
  "confidence": null,
} satisfies GeocodeCandidate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GeocodeCandidate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


