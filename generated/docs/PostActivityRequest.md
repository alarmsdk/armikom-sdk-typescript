
# PostActivityRequest


## Properties

Name | Type
------------ | -------------
`sessionId` | string
`events` | [Array&lt;ActivityEventItem&gt;](ActivityEventItem.md)

## Example

```typescript
import type { PostActivityRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sessionId": null,
  "events": null,
} satisfies PostActivityRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PostActivityRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


