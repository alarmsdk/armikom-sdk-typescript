
# SetHolidayTypeSideTypesRequest

Replaces the subscriber types a holiday type applies to (G-80). The list is the whole new set: an id left out is unlinked, an empty list unlinks every type.

## Properties

Name | Type
------------ | -------------
`sideTypeIds` | Array&lt;string&gt;

## Example

```typescript
import type { SetHolidayTypeSideTypesRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sideTypeIds": null,
} satisfies SetHolidayTypeSideTypesRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SetHolidayTypeSideTypesRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


