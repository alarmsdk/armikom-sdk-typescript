
# RoleFieldPolicyResponse

A role\'s field policy (D77).

## Properties

Name | Type
------------ | -------------
`roleId` | string
`hidden` | Array&lt;string&gt;
`readOnly` | Array&lt;string&gt;
`updatedAt` | Date
`updatedBy` | string

## Example

```typescript
import type { RoleFieldPolicyResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "roleId": null,
  "hidden": null,
  "readOnly": null,
  "updatedAt": null,
  "updatedBy": null,
} satisfies RoleFieldPolicyResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RoleFieldPolicyResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


