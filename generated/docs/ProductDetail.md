
# ProductDetail

A sellable product, referenced by subscriber product lines.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`fullName` | string
`comment` | string

## Example

```typescript
import type { ProductDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "fullName": null,
  "comment": null,
} satisfies ProductDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProductDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


