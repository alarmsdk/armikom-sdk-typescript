
# SideSignalHistoryItem


## Properties

Name | Type
------------ | -------------
`id` | string
`eventCode` | string
`zone` | string
`signalDateTime` | Date
`receiverName` | string
`action` | string
`signalDescription` | string

## Example

```typescript
import type { SideSignalHistoryItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "eventCode": null,
  "zone": null,
  "signalDateTime": null,
  "receiverName": null,
  "action": null,
  "signalDescription": null,
} satisfies SideSignalHistoryItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideSignalHistoryItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


