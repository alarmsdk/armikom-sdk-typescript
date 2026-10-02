
# SideRef

A subscriber a relation is scoped to, named the way the console lists them. Named `SideRef` rather than `SignalRelationSideRef` because the reference surface already owns that schema id, and OpenAPI has one flat schema namespace.

## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`name` | string

## Example

```typescript
import type { SideRef } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "name": null,
} satisfies SideRef

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideRef
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


