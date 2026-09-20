
# UiLayoutTemplateItem

A single template in the MC-wide pool.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`contentJson` | string
`updatedAtUtc` | Date

## Example

```typescript
import type { UiLayoutTemplateItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "contentJson": null,
  "updatedAtUtc": null,
} satisfies UiLayoutTemplateItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UiLayoutTemplateItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


