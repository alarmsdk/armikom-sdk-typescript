
# PromptDetail

An AI prompt template, attachable to alarm categories.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`content` | string
`isActive` | boolean
`alarmCategoryCount` | number

## Example

```typescript
import type { PromptDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "content": null,
  "isActive": null,
  "alarmCategoryCount": null,
} satisfies PromptDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PromptDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


