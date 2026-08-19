
# ClosingDelayListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideNo` | number
`sideName` | string
`closingDateUtc` | Date
`note` | string
`processedAtUtc` | Date
`monitoringCenterName` | string

## Example

```typescript
import type { ClosingDelayListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "closingDateUtc": null,
  "note": null,
  "processedAtUtc": null,
  "monitoringCenterName": null,
} satisfies ClosingDelayListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClosingDelayListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


