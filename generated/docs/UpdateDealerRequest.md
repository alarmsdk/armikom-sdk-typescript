
# UpdateDealerRequest


## Properties

Name | Type
------------ | -------------
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
`onCallServiceNumber` | string
`geolocation` | string

## Example

```typescript
import type { UpdateDealerRequest } from ''

// TODO: Update the object below with actual values
const example = {
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
  "onCallServiceNumber": null,
  "geolocation": null,
} satisfies UpdateDealerRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateDealerRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


