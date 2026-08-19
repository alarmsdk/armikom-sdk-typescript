
# PassiveSignalListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideNo` | number
`sideName` | string
`eventCode` | string
`sysPhone` | string
`partId` | number
`receiverName` | string
`signalName` | string
`monitoringCenterName` | string

## Example

```typescript
import type { PassiveSignalListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "eventCode": null,
  "sysPhone": null,
  "partId": null,
  "receiverName": null,
  "signalName": null,
  "monitoringCenterName": null,
} satisfies PassiveSignalListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PassiveSignalListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


