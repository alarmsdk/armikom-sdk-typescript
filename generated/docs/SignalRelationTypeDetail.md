
# SignalRelationTypeDetail

What a relation does. REMOVE and DELAY are seeded by the Engine and cannot be renamed or deleted — the pipeline dispatches on those names.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`parameterSchema` | string
`isSystem` | boolean
`relationCount` | number

## Example

```typescript
import type { SignalRelationTypeDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "parameterSchema": null,
  "isSystem": null,
  "relationCount": null,
} satisfies SignalRelationTypeDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRelationTypeDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


