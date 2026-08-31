
# ReceiverDetail

A signal receiver — the socket or serial port the Engine reads events from.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`receiverNo` | string
`active` | boolean
`monitoringCenterId` | string
`monitoringCenterName` | string
`communicationType` | number
`socketType` | number
`communicatorType` | number
`ip` | string
`port` | string
`baudRate` | string
`dataBits` | string
`parity` | string
`handShake` | string
`line` | number
`timeoutDuration` | number
`signalCount` | number
`signalLimitPerDay` | number
`delimiter` | string
`deviceRegexId` | string
`deviceRegexName` | string
`sideAllowDefault` | number
`ipAddressAllowDefault` | number
`lastSignalDate` | Date
`lastTre` | Date

## Example

```typescript
import type { ReceiverDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "receiverNo": null,
  "active": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "communicationType": null,
  "socketType": null,
  "communicatorType": null,
  "ip": null,
  "port": null,
  "baudRate": null,
  "dataBits": null,
  "parity": null,
  "handShake": null,
  "line": null,
  "timeoutDuration": null,
  "signalCount": null,
  "signalLimitPerDay": null,
  "delimiter": null,
  "deviceRegexId": null,
  "deviceRegexName": null,
  "sideAllowDefault": null,
  "ipAddressAllowDefault": null,
  "lastSignalDate": null,
  "lastTre": null,
} satisfies ReceiverDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReceiverDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


