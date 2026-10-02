
# ReorderSignalExplanationsRequest

Provide the full list of signal explanation IDs in the desired display order. The first entry will appear first in the operator\'s list.

## Properties

Name | Type
------------ | -------------
`ids` | Array&lt;string&gt;

## Example

```typescript
import type { ReorderSignalExplanationsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "ids": null,
} satisfies ReorderSignalExplanationsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReorderSignalExplanationsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


