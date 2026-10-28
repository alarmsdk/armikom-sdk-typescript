
# SetUserCustomersRequest

D86: replaces the customers an operator is limited to. An empty list lifts the limit.

## Properties

Name | Type
------------ | -------------
`customerIds` | Array&lt;string&gt;

## Example

```typescript
import type { SetUserCustomersRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "customerIds": null,
} satisfies SetUserCustomersRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SetUserCustomersRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


