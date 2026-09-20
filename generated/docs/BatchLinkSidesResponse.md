
# BatchLinkSidesResponse


## Properties

Name | Type
------------ | -------------
`requestedCount` | number
`linkedCount` | number
`alreadyLinkedCount` | number
`skippedCount` | number
`failures` | [Array&lt;BatchLinkSideFailure&gt;](BatchLinkSideFailure.md)
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { BatchLinkSidesResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "requestedCount": null,
  "linkedCount": null,
  "alreadyLinkedCount": null,
  "skippedCount": null,
  "failures": null,
  "sideEffects": null,
} satisfies BatchLinkSidesResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BatchLinkSidesResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


