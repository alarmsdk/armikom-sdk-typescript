
# BatchCompleteRequest


## Properties

Name | Type
------------ | -------------
`signalCodes` | Array&lt;string&gt;
`action` | string
`expectedCount` | number

## Example

```typescript
import type { BatchCompleteRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "signalCodes": null,
  "action": null,
  "expectedCount": null,
} satisfies BatchCompleteRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BatchCompleteRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


