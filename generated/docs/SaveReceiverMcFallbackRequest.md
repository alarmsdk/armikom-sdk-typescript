
# SaveReceiverMcFallbackRequest

PUT body — replaces the whole configuration. An omitted crossMcSideLookup is null (follow the Engine).

## Properties

Name | Type
------------ | -------------
`crossMcSideLookup` | boolean
`monitoringCenterIds` | Array&lt;string&gt;

## Example

```typescript
import type { SaveReceiverMcFallbackRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "crossMcSideLookup": null,
  "monitoringCenterIds": null,
} satisfies SaveReceiverMcFallbackRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SaveReceiverMcFallbackRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


