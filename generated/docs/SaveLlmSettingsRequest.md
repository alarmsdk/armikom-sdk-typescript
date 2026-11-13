
# SaveLlmSettingsRequest

Sets the model of the listed tasks; tasks left out keep theirs.

## Properties

Name | Type
------------ | -------------
`tasks` | [Array&lt;LlmTaskModelDto&gt;](LlmTaskModelDto.md)

## Example

```typescript
import type { SaveLlmSettingsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "tasks": null,
} satisfies SaveLlmSettingsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SaveLlmSettingsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


