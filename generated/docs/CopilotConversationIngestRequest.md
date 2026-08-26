
# CopilotConversationIngestRequest

A batch of live-call events posted by CopilotX. Batched rather than one request per  utterance because interim speech results arrive several times a second per channel and  the API\'s global rate limit is a per-principal budget, not a per-endpoint one.

## Properties

Name | Type
------------ | -------------
`events` | [Array&lt;CopilotConversationEventDto&gt;](CopilotConversationEventDto.md)

## Example

```typescript
import type { CopilotConversationIngestRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "events": null,
} satisfies CopilotConversationIngestRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotConversationIngestRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


