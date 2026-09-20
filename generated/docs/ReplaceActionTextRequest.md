
# ReplaceActionTextRequest

Replaces the entire action text on a signal event (as opposed to appending).

## Properties

Name | Type
------------ | -------------
`text` | string
`stamp` | boolean

## Example

```typescript
import type { ReplaceActionTextRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "stamp": null,
} satisfies ReplaceActionTextRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReplaceActionTextRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


