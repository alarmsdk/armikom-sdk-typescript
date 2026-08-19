
# SignalEventDetailResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`eventCode` | string
`zone` | string
`action` | string
`signalDateTime` | Date
`description` | string
`sound` | string
`receiverNo` | number
`lineNo` | number
`receiverName` | string
`monitoringCenterName` | string
`signalTypeName` | string
`signalFrontColor` | string
`signalBackColor` | string
`rawData` | string
`side` | [SignalEventSideInfo](SignalEventSideInfo.md)
`contacts` | [Array&lt;SideContactItem&gt;](SideContactItem.md)
`notes` | [Array&lt;SideNoteItem&gt;](SideNoteItem.md)
`zones` | [Array&lt;SideZoneItem&gt;](SideZoneItem.md)
`timetables` | [Array&lt;TimeTableItem&gt;](TimeTableItem.md)
`signalHistory` | [Array&lt;SideSignalHistoryItem&gt;](SideSignalHistoryItem.md)

## Example

```typescript
import type { SignalEventDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "eventCode": null,
  "zone": null,
  "action": null,
  "signalDateTime": null,
  "description": null,
  "sound": null,
  "receiverNo": null,
  "lineNo": null,
  "receiverName": null,
  "monitoringCenterName": null,
  "signalTypeName": null,
  "signalFrontColor": null,
  "signalBackColor": null,
  "rawData": null,
  "side": null,
  "contacts": null,
  "notes": null,
  "zones": null,
  "timetables": null,
  "signalHistory": null,
} satisfies SignalEventDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalEventDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


