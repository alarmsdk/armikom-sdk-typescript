
# RecentAlarmEventItem

An alarm that left the queue within the last hour (completed, quick-completed, batch-cleared or closed by a relation). Same display fields as Armikom.Api.Contracts.Alarms.AlarmEventListItem, plus when it left and who completed it.

## Properties

Name | Type
------------ | -------------
`id` | string
`signalEventId` | string
`eventDate` | Date
`sideId` | string
`sideNo` | number
`sideName` | string
`partNo` | number
`dealerId` | string
`dealerName` | string
`signalName` | string
`zone` | string
`receiverName` | string
`monitoringCenterId` | string
`monitoringCenterName` | string
`signalTypePriority` | number
`frontColor` | string
`backColor` | string
`removedAt` | Date
`completedAt` | Date
`completedByName` | string
`action` | string

## Example

```typescript
import type { RecentAlarmEventItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "signalEventId": null,
  "eventDate": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "partNo": null,
  "dealerId": null,
  "dealerName": null,
  "signalName": null,
  "zone": null,
  "receiverName": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "signalTypePriority": null,
  "frontColor": null,
  "backColor": null,
  "removedAt": null,
  "completedAt": null,
  "completedByName": null,
  "action": null,
} satisfies RecentAlarmEventItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RecentAlarmEventItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


