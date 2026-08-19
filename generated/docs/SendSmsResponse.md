
# SendSmsResponse


## Properties

Name | Type
------------ | -------------
`queuedCount` | number
`phones` | Array&lt;string&gt;
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SendSmsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "queuedCount": null,
  "phones": null,
  "sideEffects": null,
} satisfies SendSmsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SendSmsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


