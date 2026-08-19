
# SideListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`partNo` | number
`name` | string
`active` | boolean
`approved` | boolean
`isOpen` | boolean
`cloudAlarm` | boolean
`lockUser` | string
`cityName` | string
`districtName` | string
`brandName` | string
`modelName` | string
`protocolName` | string
`accountTypeName` | string
`monitoringCenterName` | string
`dealerName` | string
`sideTypeName` | string
`customerName` | string
`serialNumber` | string
`address` | string
`phone1` | string
`comment` | string
`installDate` | Date
`startDate` | Date
`endDate` | Date
`passiveDate` | Date
`lastSignalDate` | Date

## Example

```typescript
import type { SideListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "partNo": null,
  "name": null,
  "active": null,
  "approved": null,
  "isOpen": null,
  "cloudAlarm": null,
  "lockUser": null,
  "cityName": null,
  "districtName": null,
  "brandName": null,
  "modelName": null,
  "protocolName": null,
  "accountTypeName": null,
  "monitoringCenterName": null,
  "dealerName": null,
  "sideTypeName": null,
  "customerName": null,
  "serialNumber": null,
  "address": null,
  "phone1": null,
  "comment": null,
  "installDate": null,
  "startDate": null,
  "endDate": null,
  "passiveDate": null,
  "lastSignalDate": null,
} satisfies SideListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


