
# SetRoleFieldPolicyRequest

PUT body for a role\'s field policy. Replaces both lists. Unknown or non-lockable keys are  refused with 400 rather than silently dropped.

## Properties

Name | Type
------------ | -------------
`hidden` | Array&lt;string&gt;
`readOnly` | Array&lt;string&gt;

## Example

```typescript
import type { SetRoleFieldPolicyRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "hidden": null,
  "readOnly": null,
} satisfies SetRoleFieldPolicyRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SetRoleFieldPolicyRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


