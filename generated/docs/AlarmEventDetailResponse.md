
# AlarmEventDetailResponse


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
`sideLockUserId` | string
`sideLockUserName` | string
`lockedAtUtc` | Date
`dealerId` | string
`dealerName` | string
`signalName` | string
`zone` | string
`receiverName` | string
`monitoringCenterId` | string
`monitoringCenterName` | string
`signalTypePriority` | number
`signalTypeSoundAlert` | boolean
`actionText` | string
`frontColor` | string
`backColor` | string
`resolvedTimeZone` | string
`signalEvent` | [SignalEventDetailResponse](SignalEventDetailResponse.md)

## Example

```typescript
import type { AlarmEventDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "signalEventId": null,
  "eventDate": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "partNo": null,
  "sideLockUserId": null,
  "sideLockUserName": null,
  "lockedAtUtc": null,
  "dealerId": null,
  "dealerName": null,
  "signalName": null,
  "zone": null,
  "receiverName": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "signalTypePriority": null,
  "signalTypeSoundAlert": null,
  "actionText": null,
  "frontColor": null,
  "backColor": null,
  "resolvedTimeZone": null,
  "signalEvent": null,
} satisfies AlarmEventDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AlarmEventDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


