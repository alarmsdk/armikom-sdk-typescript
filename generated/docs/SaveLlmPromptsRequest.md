
# SaveLlmPromptsRequest

Sets the text of the listed prompts; prompts left out keep theirs.

## Properties

Name | Type
------------ | -------------
`prompts` | [Array&lt;LlmPromptTextDto&gt;](LlmPromptTextDto.md)

## Example

```typescript
import type { SaveLlmPromptsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "prompts": null,
} satisfies SaveLlmPromptsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SaveLlmPromptsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


