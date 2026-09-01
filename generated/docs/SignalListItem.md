
# SignalListItem

One row of the signal dictionary as the list returns it (G-76).                The list used to project `Signal` down to Armikom.Api.Contracts.Reference.LookupItem, which  carried the event code and nothing else — so a client listing a protocol\'s  dictionary could not show what any code resolved to without one  `GetSignalById` per row. This carries the mapping.                 `Name` and `ParentId` are retained aliases of Armikom.Api.Contracts.Admin.SignalListItem.EventCode  and Armikom.Api.Contracts.Admin.SignalListItem.ProtocolId, so the pickers that bind to the old  `LookupItem` shape keep working. New callers should read the named  properties.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`parentId` | string
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
import type { SignalListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "parentId": null,
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
} satisfies SignalListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


