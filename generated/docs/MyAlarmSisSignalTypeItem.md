
# MyAlarmSisSignalTypeItem

One signal type known to either side of the MyAlarmSis comparison — the legacy `sinyalturleri` dictionary and/or Armikom\'s `SignalType`. Used by the console to offer the exclusion list.

## Properties

Name | Type
------------ | -------------
`code` | string
`myAlarmSisName` | string
`armikomName` | string
`myAlarmSisAlarm` | boolean
`armikomAlarm` | boolean
`softwareGenerated` | boolean

## Example

```typescript
import type { MyAlarmSisSignalTypeItem } from ''

// TODO: Update the object below with actual values
const example = {
  "code": null,
  "myAlarmSisName": null,
  "armikomName": null,
  "myAlarmSisAlarm": null,
  "armikomAlarm": null,
  "softwareGenerated": null,
} satisfies MyAlarmSisSignalTypeItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisSignalTypeItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


