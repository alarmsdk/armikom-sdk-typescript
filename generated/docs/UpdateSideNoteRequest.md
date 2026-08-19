
# UpdateSideNoteRequest


## Properties

Name | Type
------------ | -------------
`text` | string
`important` | boolean
`validDate` | Date
`fontColor` | string
`noteTypeId` | string
`alarmCategoryId` | string

## Example

```typescript
import type { UpdateSideNoteRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "important": null,
  "validDate": null,
  "fontColor": null,
  "noteTypeId": null,
  "alarmCategoryId": null,
} satisfies UpdateSideNoteRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateSideNoteRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


