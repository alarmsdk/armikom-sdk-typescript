
# SignalRuleWriteRequest

Body of a create or a full update. Every field is written.

## Properties

Name | Type
------------ | -------------
`code` | string
`name` | string
`description` | string
`priority` | number
`mode` | string
`stopProcessing` | boolean
`allowCritical` | boolean
`validFrom` | Date
`validTo` | Date
`when` | [SignalRuleCondition](SignalRuleCondition.md)
`then` | [Array&lt;SignalRuleAction&gt;](SignalRuleAction.md)

## Example

```typescript
import type { SignalRuleWriteRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "code": null,
  "name": null,
  "description": null,
  "priority": null,
  "mode": null,
  "stopProcessing": null,
  "allowCritical": null,
  "validFrom": null,
  "validTo": null,
  "when": null,
  "then": null,
} satisfies SignalRuleWriteRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleWriteRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


