
# MyAlarmSisSignalSnapshot

One `mesajlar` row, normalised for comparison.

## Properties

Name | Type
------------ | -------------
`sira` | number
`signalDateTimeUtc` | Date
`accountCode` | string
`sideNo` | number
`partNo` | number
`receiverNo` | string
`lineNo` | string
`eventCode` | string
`zone` | string
`zoneName` | string
`signalTypeCode` | string
`signalName` | string
`alarm` | boolean
`priority` | number
`alarmCategoryCode` | string
`alarmCategoryName` | string
`sideName` | string
`monitoringCenterId` | string
`monitoringCenterName` | string

## Example

```typescript
import type { MyAlarmSisSignalSnapshot } from ''

// TODO: Update the object below with actual values
const example = {
  "sira": null,
  "signalDateTimeUtc": null,
  "accountCode": null,
  "sideNo": null,
  "partNo": null,
  "receiverNo": null,
  "lineNo": null,
  "eventCode": null,
  "zone": null,
  "zoneName": null,
  "signalTypeCode": null,
  "signalName": null,
  "alarm": null,
  "priority": null,
  "alarmCategoryCode": null,
  "alarmCategoryName": null,
  "sideName": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
} satisfies MyAlarmSisSignalSnapshot

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisSignalSnapshot
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


