
# DealerDetailResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`fullName` | string
`address` | string
`cityId` | string
`regionId` | string
`districtId` | string
`contact1` | string
`contact2` | string
`mail1` | string
`mail2` | string
`mail3` | string
`taxNo` | string
`taxOffice` | string
`active` | boolean
`releatedDealerId` | string
`recordDateTime` | Date
`onCallServiceNumber` | string
`geolocation` | string
`monitoringCenterId` | string
`hasLogo` | boolean

## Example

```typescript
import type { DealerDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "fullName": null,
  "address": null,
  "cityId": null,
  "regionId": null,
  "districtId": null,
  "contact1": null,
  "contact2": null,
  "mail1": null,
  "mail2": null,
  "mail3": null,
  "taxNo": null,
  "taxOffice": null,
  "active": null,
  "releatedDealerId": null,
  "recordDateTime": null,
  "onCallServiceNumber": null,
  "geolocation": null,
  "monitoringCenterId": null,
  "hasLogo": null,
} satisfies DealerDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DealerDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


