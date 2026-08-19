
# LiveSignalItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`partNo` | number
`sideName` | string
`signalDescription` | string
`zone` | string
`signalDateTime` | Date
`receiverName` | string
`monitoringCenterName` | string
`frontColor` | string
`backColor` | string
`sideId` | string

## Example

```typescript
import type { LiveSignalItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "partNo": null,
  "sideName": null,
  "signalDescription": null,
  "zone": null,
  "signalDateTime": null,
  "receiverName": null,
  "monitoringCenterName": null,
  "frontColor": null,
  "backColor": null,
  "sideId": null,
} satisfies LiveSignalItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LiveSignalItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


