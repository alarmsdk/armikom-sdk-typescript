
# SignalExportRequest

Body of `POST /v1/signal-events/export`. The filter fields mirror the query parameters of `GET /v1/signal-events` one for one (same names, same comma-separated id and name lists, same `...Not` counterparts), so the file holds exactly the rows the explorer showed.

## Properties

Name | Type
------------ | -------------
`query` | string
`from` | Date
`to` | Date
`sort` | string
`format` | string
`timeZone` | string
`sideNo` | number
`sideName` | string
`receiverName` | string
`monitoringCenterName` | string
`action` | string
`signalName` | string
`sideId` | string
`receiverId` | string
`monitoringCenterId` | string
`eventCode` | string
`dealerId` | string
`alarmCategoryId` | string
`businessSectorId` | string
`customerId` | string
`communicationTypeId` | string
`completedById` | string
`completedByName` | string
`sideIdNot` | string
`receiverIdNot` | string
`monitoringCenterIdNot` | string
`eventCodeNot` | string
`dealerIdNot` | string
`alarmCategoryIdNot` | string
`businessSectorIdNot` | string
`customerIdNot` | string
`communicationTypeIdNot` | string
`actionNot` | string
`signalNameNot` | string
`completedByIdNot` | string
`completedByNameNot` | string

## Example

```typescript
import type { SignalExportRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "query": null,
  "from": null,
  "to": null,
  "sort": null,
  "format": null,
  "timeZone": null,
  "sideNo": null,
  "sideName": null,
  "receiverName": null,
  "monitoringCenterName": null,
  "action": null,
  "signalName": null,
  "sideId": null,
  "receiverId": null,
  "monitoringCenterId": null,
  "eventCode": null,
  "dealerId": null,
  "alarmCategoryId": null,
  "businessSectorId": null,
  "customerId": null,
  "communicationTypeId": null,
  "completedById": null,
  "completedByName": null,
  "sideIdNot": null,
  "receiverIdNot": null,
  "monitoringCenterIdNot": null,
  "eventCodeNot": null,
  "dealerIdNot": null,
  "alarmCategoryIdNot": null,
  "businessSectorIdNot": null,
  "customerIdNot": null,
  "communicationTypeIdNot": null,
  "actionNot": null,
  "signalNameNot": null,
  "completedByIdNot": null,
  "completedByNameNot": null,
} satisfies SignalExportRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalExportRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


