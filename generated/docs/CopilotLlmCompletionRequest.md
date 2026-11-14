
# CopilotLlmCompletionRequest

One model call for the call copilot (CopilotX), run on this installation\'s AI settings (D90).

## Properties

Name | Type
------------ | -------------
`purpose` | string
`prompt` | string
`schema` | any

## Example

```typescript
import type { CopilotLlmCompletionRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "purpose": null,
  "prompt": null,
  "schema": null,
} satisfies CopilotLlmCompletionRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotLlmCompletionRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


