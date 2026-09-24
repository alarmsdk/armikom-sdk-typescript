
# SideGuardTourItem

Guard tour (bekçi takip) definition. Between Armikom.Api.Contracts.Sides.SideGuardTourItem.StartTime and Armikom.Api.Contracts.Sides.SideGuardTourItem.EndTime (subscriber wall clock, \"HH:mm\"; an end not after the start crosses midnight) a signal of one of Armikom.Api.Contracts.Sides.SideGuardTourItem.SignalTypeIds must arrive from the zone every Armikom.Api.Contracts.Sides.SideGuardTourItem.IntervalMinutes, otherwise the Engine raises the system signal GTM.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`sideZoneId` | string
`zoneNo` | number
`zoneName` | string
`startTime` | string
`endTime` | string
`intervalMinutes` | number
`active` | boolean
`notes` | string
`signalTypeIds` | Array&lt;string&gt;
`signalTypes` | [Array&lt;SideGuardTourSignalTypeItem&gt;](SideGuardTourSignalTypeItem.md)
`lastAlarmAt` | Date

## Example

```typescript
import type { SideGuardTourItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "sideZoneId": null,
  "zoneNo": null,
  "zoneName": null,
  "startTime": null,
  "endTime": null,
  "intervalMinutes": null,
  "active": null,
  "notes": null,
  "signalTypeIds": null,
  "signalTypes": null,
  "lastAlarmAt": null,
} satisfies SideGuardTourItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideGuardTourItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


