
# BatchLinkSidesRequest

Body for `POST /v1/mobile-users/{id}/sides/batch-link`: attach one user to many subscribers in a single call.

## Properties

Name | Type
------------ | -------------
`sideIds` | Array&lt;string&gt;
`expectedCount` | number

## Example

```typescript
import type { BatchLinkSidesRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sideIds": null,
  "expectedCount": null,
} satisfies BatchLinkSidesRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BatchLinkSidesRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


