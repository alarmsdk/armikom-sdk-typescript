
# SignalBlockListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideNo` | number
`sideName` | string
`signalCode` | string
`signalName` | string
`recordDateUtc` | Date
`endDateUtc` | Date
`monitoringCenterName` | string
`isExpired` | boolean

## Example

```typescript
import type { SignalBlockListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "signalCode": null,
  "signalName": null,
  "recordDateUtc": null,
  "endDateUtc": null,
  "monitoringCenterName": null,
  "isExpired": null,
} satisfies SignalBlockListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalBlockListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


