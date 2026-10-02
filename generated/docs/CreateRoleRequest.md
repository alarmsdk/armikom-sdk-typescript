
# CreateRoleRequest

D78: creates an operator role from the web. The role starts with the given scopes, or a copy of another role\'s scopes, or none. It has no XAF permission rows (XAF is no longer used).

## Properties

Name | Type
------------ | -------------
`name` | string
`scopes` | Array&lt;string&gt;
`copyScopesFromRoleId` | string

## Example

```typescript
import type { CreateRoleRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "scopes": null,
  "copyScopesFromRoleId": null,
} satisfies CreateRoleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateRoleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


