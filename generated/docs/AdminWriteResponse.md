
# AdminWriteResponse

Uniform body returned by every admin create and update. Update returns the id  it was given, so a client can use one response shape for both verbs.

## Properties

Name | Type
------------ | -------------
`id` | string

## Example

```typescript
import type { AdminWriteResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
} satisfies AdminWriteResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminWriteResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


