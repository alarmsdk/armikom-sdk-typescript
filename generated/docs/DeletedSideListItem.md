
# DeletedSideListItem

A soft-deleted subscriber, for the restore list.

## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`partNo` | number
`name` | string
`customerName` | string
`dealerName` | string
`deletedAt` | Date
`deletedBy` | string

## Example

```typescript
import type { DeletedSideListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "partNo": null,
  "name": null,
  "customerName": null,
  "dealerName": null,
  "deletedAt": null,
  "deletedBy": null,
} satisfies DeletedSideListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeletedSideListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


