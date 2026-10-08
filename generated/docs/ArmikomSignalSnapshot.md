
# ArmikomSignalSnapshot

One Armikom `SignalEvent`, normalised for comparison.

## Properties

Name | Type
------------ | -------------
`id` | string
`signalDateTimeUtc` | Date
`sideNo` | number
`partNo` | number
`receiverNo` | string
`lineNo` | string
`eventCode` | string
`zone` | string
`signalTypeCode` | string
`signalName` | string
`alarm` | boolean
`priority` | number
`alarmCategoryName` | string
`sideName` | string
`monitoringCenterId` | string
`monitoringCenterName` | string
`realSignal` | boolean

## Example

```typescript
import type { ArmikomSignalSnapshot } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "signalDateTimeUtc": null,
  "sideNo": null,
  "partNo": null,
  "receiverNo": null,
  "lineNo": null,
  "eventCode": null,
  "zone": null,
  "signalTypeCode": null,
  "signalName": null,
  "alarm": null,
  "priority": null,
  "alarmCategoryName": null,
  "sideName": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "realSignal": null,
} satisfies ArmikomSignalSnapshot

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ArmikomSignalSnapshot
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


