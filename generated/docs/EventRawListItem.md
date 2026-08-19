
# EventRawListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`recordDateTimeUtc` | Date
`rawData` | string
`receiverId` | string
`receiverName` | string

## Example

```typescript
import type { EventRawListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "recordDateTimeUtc": null,
  "rawData": null,
  "receiverId": null,
  "receiverName": null,
} satisfies EventRawListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EventRawListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


