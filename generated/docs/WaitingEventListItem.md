
# WaitingEventListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`eventId` | string
`sideNo` | number
`sideName` | string
`sidePartNo` | number
`signalName` | string
`zone` | string
`receiverName` | string
`eventDateUtc` | Date
`delayUntilUtc` | Date
`monitoringCenterName` | string

## Example

```typescript
import type { WaitingEventListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "eventId": null,
  "sideNo": null,
  "sideName": null,
  "sidePartNo": null,
  "signalName": null,
  "zone": null,
  "receiverName": null,
  "eventDateUtc": null,
  "delayUntilUtc": null,
  "monitoringCenterName": null,
} satisfies WaitingEventListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WaitingEventListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


