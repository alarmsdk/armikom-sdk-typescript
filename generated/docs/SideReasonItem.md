
# SideReasonItem


## Properties

Name | Type
------------ | -------------
`id` | string
`activeCategoryId` | string
`activeCategoryName` | string
`categoryActive` | boolean
`comment` | string
`recordDate` | Date
`operatorId` | string
`operatorName` | string

## Example

```typescript
import type { SideReasonItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "activeCategoryId": null,
  "activeCategoryName": null,
  "categoryActive": null,
  "comment": null,
  "recordDate": null,
  "operatorId": null,
  "operatorName": null,
} satisfies SideReasonItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideReasonItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


