
# CopilotProposedOperationDto

The console operation being proposed. The name is not validated against a vocabulary  here — the console runs the ones it knows and renders the rest as text, so a new  operation ships without an API release and an older console cannot be told to run  something it does not understand.

## Properties

Name | Type
------------ | -------------
`name` | string
`scope` | string
`parameters` | { [key: string]: string | undefined | null; }

## Example

```typescript
import type { CopilotProposedOperationDto } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "scope": null,
  "parameters": null,
} satisfies CopilotProposedOperationDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotProposedOperationDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


