
# GeocodeSideResponse


## Properties

Name | Type
------------ | -------------
`latitude` | string
`longitude` | string
`provider` | string
`candidates` | [Array&lt;GeocodeCandidate&gt;](GeocodeCandidate.md)
`sideEffects` | [Array&lt;SideEffect&gt;](SideEffect.md)

## Example

```typescript
import type { GeocodeSideResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "latitude": null,
  "longitude": null,
  "provider": null,
  "candidates": null,
  "sideEffects": null,
} satisfies GeocodeSideResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GeocodeSideResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


