
# SignalRelationDetail


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`kind` | string
`sourceSignalTypes` | [Array&lt;SignalTypeRef&gt;](SignalTypeRef.md)
`targetSignalTypes` | [Array&lt;SignalTypeRef&gt;](SignalTypeRef.md)

## Example

```typescript
import type { SignalRelationDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "kind": null,
  "sourceSignalTypes": null,
  "targetSignalTypes": null,
} satisfies SignalRelationDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRelationDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


