
# SideNoteItem


## Properties

Name | Type
------------ | -------------
`id` | string
`text` | string
`important` | boolean
`recordDate` | Date
`validDate` | Date
`fontColor` | string
`noteTypeId` | string
`noteTypeName` | string
`alarmCategoryId` | string
`alarmCategoryName` | string

## Example

```typescript
import type { SideNoteItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "text": null,
  "important": null,
  "recordDate": null,
  "validDate": null,
  "fontColor": null,
  "noteTypeId": null,
  "noteTypeName": null,
  "alarmCategoryId": null,
  "alarmCategoryName": null,
} satisfies SideNoteItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideNoteItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


