
# UserCustomersResponse

D86: an operator\'s customer scope. Empty `customers` = not limited.

## Properties

Name | Type
------------ | -------------
`customers` | [Array&lt;OperatorCustomerAssignment&gt;](OperatorCustomerAssignment.md)

## Example

```typescript
import type { UserCustomersResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "customers": null,
} satisfies UserCustomersResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserCustomersResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


