
# SignalRelationItem

One relation rule as the read surface exposes it: what triggers it, what it acts on, what it does and who it applies to.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`typeId` | string
`typeName` | string
`global` | boolean
`parameters` | string
`triggerCondition` | string
`promptId` | string
`promptName` | string
`priority` | number
`validFrom` | Date
`validTo` | Date
`sourceSignalTypes` | [Array&lt;SignalRelationSignalTypeRef&gt;](SignalRelationSignalTypeRef.md)
`targetSignalTypes` | [Array&lt;SignalRelationSignalTypeRef&gt;](SignalRelationSignalTypeRef.md)
`sides` | [Array&lt;SignalRelationSideRef&gt;](SignalRelationSideRef.md)

## Example

```typescript
import type { SignalRelationItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "typeId": null,
  "typeName": null,
  "global": null,
  "parameters": null,
  "triggerCondition": null,
  "promptId": null,
  "promptName": null,
  "priority": null,
  "validFrom": null,
  "validTo": null,
  "sourceSignalTypes": null,
  "targetSignalTypes": null,
  "sides": null,
} satisfies SignalRelationItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRelationItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


