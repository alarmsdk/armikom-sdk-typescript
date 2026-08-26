
# SignalEventListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`partNo` | number
`sideName` | string
`eventCode` | string
`signalDescription` | string
`zone` | string
`signalDateTime` | Date
`receiverName` | string
`monitoringCenterName` | string
`action` | string
`sideId` | string
`dealerName` | string
`alarmCategoryName` | string

## Example

```typescript
import type { SignalEventListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "partNo": null,
  "sideName": null,
  "eventCode": null,
  "signalDescription": null,
  "zone": null,
  "signalDateTime": null,
  "receiverName": null,
  "monitoringCenterName": null,
  "action": null,
  "sideId": null,
  "dealerName": null,
  "alarmCategoryName": null,
} satisfies SignalEventListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalEventListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


