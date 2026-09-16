
# CityEmergencyContactDetail

An emergency contact (police, fire, medical) attached to a city.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`number` | string
`order` | number
`type` | number

## Example

```typescript
import type { CityEmergencyContactDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "number": null,
  "order": null,
  "type": null,
} satisfies CityEmergencyContactDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CityEmergencyContactDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


