
# CopilotConversationIngestResponse

What the relay accepted. 202 means published, not read by an operator.

## Properties

Name | Type
------------ | -------------
`accepted` | boolean
`acceptedCount` | number
`rejectedCount` | number
`rejections` | Array&lt;string&gt;

## Example

```typescript
import type { CopilotConversationIngestResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "accepted": null,
  "acceptedCount": null,
  "rejectedCount": null,
  "rejections": null,
} satisfies CopilotConversationIngestResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotConversationIngestResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


