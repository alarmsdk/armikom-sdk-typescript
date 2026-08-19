
# SmsLogListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideNo` | number
`sideName` | string
`phone` | string
`smsText` | string
`sendDateUtc` | Date
`isSent` | boolean

## Example

```typescript
import type { SmsLogListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "phone": null,
  "smsText": null,
  "sendDateUtc": null,
  "isSent": null,
} satisfies SmsLogListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SmsLogListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


