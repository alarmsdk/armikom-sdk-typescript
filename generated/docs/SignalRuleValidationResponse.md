
# SignalRuleValidationResponse

Result of a validation-only call. Nothing is written.

## Properties

Name | Type
------------ | -------------
`valid` | boolean
`errors` | Array&lt;string&gt;

## Example

```typescript
import type { SignalRuleValidationResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "valid": null,
  "errors": null,
} satisfies SignalRuleValidationResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleValidationResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


