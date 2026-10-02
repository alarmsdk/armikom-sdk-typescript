
# PhoneNormalizationResult

Result of a batch normalization run.

## Properties

Name | Type
------------ | -------------
`entities` | [Array&lt;PhoneNormalizationEntityResult&gt;](PhoneNormalizationEntityResult.md)
`totalUpdated` | number

## Example

```typescript
import type { PhoneNormalizationResult } from ''

// TODO: Update the object below with actual values
const example = {
  "entities": null,
  "totalUpdated": null,
} satisfies PhoneNormalizationResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PhoneNormalizationResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


