
# SideBatchFilterRequest

The same criteria the subscriber list takes on its query string, in a request body. Inherits the advanced half so the two can never drift apart — a batch that selected a different set from the grid the operator was reading is the whole risk here.

## Properties

Name | Type
------------ | -------------
`cityId` | string
`districtId` | string
`regionId` | string
`brandId` | string
`modelId` | string
`protocolId` | string
`accountTypeId` | string
`businessSectorId` | string
`sideTypeId` | string
`monitoringCenterId` | string
`installerId` | string
`customerId` | string
`dealerIds` | string
`cityIdNot` | string
`districtIdNot` | string
`regionIdNot` | string
`brandIdNot` | string
`modelIdNot` | string
`protocolIdNot` | string
`accountTypeIdNot` | string
`businessSectorIdNot` | string
`sideTypeIdNot` | string
`monitoringCenterIdNot` | string
`installerIdNot` | string
`customerIdNot` | string
`dealerIdNot` | string
`name` | string
`nameNot` | string
`address` | string
`addressNot` | string
`serialNumber` | string
`serialNumberNot` | string
`comment` | string
`commentNot` | string
`phone` | string
`phoneNot` | string
`isOpen` | boolean
`cloudAlarm` | boolean
`neverSignalled` | boolean
`sideNoFrom` | number
`sideNoTo` | number
`installDateFrom` | Date
`installDateTo` | Date
`startDateFrom` | Date
`startDateTo` | Date
`endDateFrom` | Date
`endDateTo` | Date
`lastSignalFrom` | Date
`lastSignalTo` | Date
`q` | string
`active` | boolean
`approved` | boolean
`dealerId` | string

## Example

```typescript
import type { SideBatchFilterRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "cityId": null,
  "districtId": null,
  "regionId": null,
  "brandId": null,
  "modelId": null,
  "protocolId": null,
  "accountTypeId": null,
  "businessSectorId": null,
  "sideTypeId": null,
  "monitoringCenterId": null,
  "installerId": null,
  "customerId": null,
  "dealerIds": null,
  "cityIdNot": null,
  "districtIdNot": null,
  "regionIdNot": null,
  "brandIdNot": null,
  "modelIdNot": null,
  "protocolIdNot": null,
  "accountTypeIdNot": null,
  "businessSectorIdNot": null,
  "sideTypeIdNot": null,
  "monitoringCenterIdNot": null,
  "installerIdNot": null,
  "customerIdNot": null,
  "dealerIdNot": null,
  "name": null,
  "nameNot": null,
  "address": null,
  "addressNot": null,
  "serialNumber": null,
  "serialNumberNot": null,
  "comment": null,
  "commentNot": null,
  "phone": null,
  "phoneNot": null,
  "isOpen": null,
  "cloudAlarm": null,
  "neverSignalled": null,
  "sideNoFrom": null,
  "sideNoTo": null,
  "installDateFrom": null,
  "installDateTo": null,
  "startDateFrom": null,
  "startDateTo": null,
  "endDateFrom": null,
  "endDateTo": null,
  "lastSignalFrom": null,
  "lastSignalTo": null,
  "q": null,
  "active": null,
  "approved": null,
  "dealerId": null,
} satisfies SideBatchFilterRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideBatchFilterRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


