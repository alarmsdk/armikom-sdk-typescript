
# SignalRelationDetail

One rule: when a signal of any source type arrives, do what Armikom.Api.Contracts.Admin.SignalRelationDetail.TypeName says to the open alarms of every target type.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`typeId` | string
`typeName` | string
`global` | boolean
`parameters` | string
`priority` | number
`sourceSignalTypes` | [Array&lt;SignalTypeRef&gt;](SignalTypeRef.md)
`targetSignalTypes` | [Array&lt;SignalTypeRef&gt;](SignalTypeRef.md)
`sides` | [Array&lt;SideRef&gt;](SideRef.md)

## Example

```typescript
import type { SignalRelationDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "typeId": null,
  "typeName": null,
  "global": null,
  "parameters": null,
  "priority": null,
  "sourceSignalTypes": null,
  "targetSignalTypes": null,
  "sides": null,
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


