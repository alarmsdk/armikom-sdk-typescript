
# SignalDetail

One row of the signal dictionary: the mapping the Engine looks up when a packet  arrives. It has no name or colours of its own — those come from the  Armikom.Api.Contracts.Admin.SignalDetail.SignalTypeId it points at.

## Properties

Name | Type
------------ | -------------
`id` | string
`eventCode` | string
`userCode` | string
`userNo` | string
`protocolId` | string
`protocolName` | string
`signalTypeId` | string
`signalTypeName` | string
`signalTypeCode` | string
`alarmCategoryId` | string
`alarmCategoryName` | string

## Example

```typescript
import type { SignalDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "eventCode": null,
  "userCode": null,
  "userNo": null,
  "protocolId": null,
  "protocolName": null,
  "signalTypeId": null,
  "signalTypeName": null,
  "signalTypeCode": null,
  "alarmCategoryId": null,
  "alarmCategoryName": null,
} satisfies SignalDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


