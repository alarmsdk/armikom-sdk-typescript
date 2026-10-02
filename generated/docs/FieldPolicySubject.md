
# FieldPolicySubject

Something a field policy can be set for: an operator role or a virtual role.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`kind` | string
`exempt` | boolean
`hasPolicy` | boolean

## Example

```typescript
import type { FieldPolicySubject } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "kind": null,
  "exempt": null,
  "hasPolicy": null,
} satisfies FieldPolicySubject

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FieldPolicySubject
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


