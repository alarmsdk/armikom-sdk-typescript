
# CreateReceiverRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`receiverNo` | string
`active` | boolean
`monitoringCenterId` | string
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
`sideAllowDefault` | number
`ipAddressAllowDefault` | number

## Example

```typescript
import type { CreateReceiverRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "receiverNo": null,
  "active": null,
  "monitoringCenterId": null,
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
  "sideAllowDefault": null,
  "ipAddressAllowDefault": null,
} satisfies CreateReceiverRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateReceiverRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


