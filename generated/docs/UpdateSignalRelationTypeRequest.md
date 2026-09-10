
# UpdateSignalRelationTypeRequest

PATCH body — a property left null is not written.

## Properties

Name | Type
------------ | -------------
`name` | string
`parameterSchema` | string

## Example

```typescript
import type { UpdateSignalRelationTypeRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "parameterSchema": null,
} satisfies UpdateSignalRelationTypeRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateSignalRelationTypeRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


