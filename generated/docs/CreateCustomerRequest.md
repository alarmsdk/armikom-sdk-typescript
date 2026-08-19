
# CreateCustomerRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`sideId` | string
`address` | string
`phone1` | string
`phone2` | string
`cityId` | string
`districtId` | string
`email1` | string
`email2` | string
`taxOffice` | string
`taxNo` | string
`latitude` | string
`longitude` | string
`geolocation` | string
`timeZone` | string

## Example

```typescript
import type { CreateCustomerRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "sideId": null,
  "address": null,
  "phone1": null,
  "phone2": null,
  "cityId": null,
  "districtId": null,
  "email1": null,
  "email2": null,
  "taxOffice": null,
  "taxNo": null,
  "latitude": null,
  "longitude": null,
  "geolocation": null,
  "timeZone": null,
} satisfies CreateCustomerRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateCustomerRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


