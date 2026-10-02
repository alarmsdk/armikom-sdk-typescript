
# FieldCatalogEntry

One field a role may hide or make read-only (D77). Built from the API\'s DTOs.

## Properties

Name | Type
------------ | -------------
`key` | string
`entity` | string
`field` | string
`lockable` | boolean
`readable` | boolean
`writable` | boolean
`carriedBy` | Array&lt;string&gt;

## Example

```typescript
import type { FieldCatalogEntry } from ''

// TODO: Update the object below with actual values
const example = {
  "key": null,
  "entity": null,
  "field": null,
  "lockable": null,
  "readable": null,
  "writable": null,
  "carriedBy": null,
} satisfies FieldCatalogEntry

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FieldCatalogEntry
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


