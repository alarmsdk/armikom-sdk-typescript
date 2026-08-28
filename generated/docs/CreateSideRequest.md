
# CreateSideRequest


## Properties

Name | Type
------------ | -------------
`sideNo` | number
`partNo` | number
`name` | string
`address` | string
`phone1` | string
`phone2` | string
`sysPhone` | string
`mobilePhone` | string
`comment` | string
`serialNumber` | string
`safePassword` | string
`identityNo` | string
`policeStationNo` | string
`latitude` | string
`longitude` | string
`timeZone` | string
`armType` | string
`timeoutDurationMinutes` | number
`gprsTimeoutMinutes` | number
`gprs` | boolean
`gprsModule` | number
`ebsModulePort` | number
`customerId` | string
`customerName` | string
`dealerId` | string
`installerId` | string
`brandId` | string
`modelId` | string
`protocolId` | string
`cityId` | string
`districtId` | string
`regionId` | string
`accountTypeId` | string
`sideTypeId` | string
`monitoringCenterId` | string
`installDate` | Date
`startDate` | Date
`endDate` | Date

## Example

```typescript
import type { CreateSideRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sideNo": null,
  "partNo": null,
  "name": null,
  "address": null,
  "phone1": null,
  "phone2": null,
  "sysPhone": null,
  "mobilePhone": null,
  "comment": null,
  "serialNumber": null,
  "safePassword": null,
  "identityNo": null,
  "policeStationNo": null,
  "latitude": null,
  "longitude": null,
  "timeZone": null,
  "armType": null,
  "timeoutDurationMinutes": null,
  "gprsTimeoutMinutes": null,
  "gprs": null,
  "gprsModule": null,
  "ebsModulePort": null,
  "customerId": null,
  "customerName": null,
  "dealerId": null,
  "installerId": null,
  "brandId": null,
  "modelId": null,
  "protocolId": null,
  "cityId": null,
  "districtId": null,
  "regionId": null,
  "accountTypeId": null,
  "sideTypeId": null,
  "monitoringCenterId": null,
  "installDate": null,
  "startDate": null,
  "endDate": null,
} satisfies CreateSideRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSideRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


