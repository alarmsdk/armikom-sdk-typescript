
# SideBatchUpdateRequest

A batch field assignment over the subscribers a search found: \"these four hundred sides all move to protocol X\".

## Properties

Name | Type
------------ | -------------
`sideIds` | Array&lt;string&gt;
`filter` | [SideBatchFilterRequest](SideBatchFilterRequest.md)
`expectedCount` | number
`changes` | [SideBatchUpdateChanges](SideBatchUpdateChanges.md)

## Example

```typescript
import type { SideBatchUpdateRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sideIds": null,
  "filter": null,
  "expectedCount": null,
  "changes": null,
} satisfies SideBatchUpdateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideBatchUpdateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


