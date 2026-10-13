
# TranslationOverrideItem

One override with who changed it last (D82, administration view).

## Properties

Name | Type
------------ | -------------
`culture` | string
`key` | string
`value` | string
`updatedAt` | Date
`updatedBy` | string

## Example

```typescript
import type { TranslationOverrideItem } from ''

// TODO: Update the object below with actual values
const example = {
  "culture": null,
  "key": null,
  "value": null,
  "updatedAt": null,
  "updatedBy": null,
} satisfies TranslationOverrideItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TranslationOverrideItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


