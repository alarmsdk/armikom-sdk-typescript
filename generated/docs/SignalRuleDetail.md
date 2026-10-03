
# SignalRuleDetail

A rule with its body.

## Properties

Name | Type
------------ | -------------
`id` | string
`global` | boolean
`code` | string
`name` | string
`description` | string
`priority` | number
`mode` | string
`stopProcessing` | boolean
`allowCritical` | boolean
`validFrom` | Date
`validTo` | Date
`managedAsCode` | boolean
`sourcePath` | string
`sourceRevision` | string
`updatedAt` | Date
`updatedBy` | string
`when` | [SignalRuleCondition](SignalRuleCondition.md)
`then` | [Array&lt;SignalRuleAction&gt;](SignalRuleAction.md)
`problems` | Array&lt;string&gt;

## Example

```typescript
import type { SignalRuleDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "global": null,
  "code": null,
  "name": null,
  "description": null,
  "priority": null,
  "mode": null,
  "stopProcessing": null,
  "allowCritical": null,
  "validFrom": null,
  "validTo": null,
  "managedAsCode": null,
  "sourcePath": null,
  "sourceRevision": null,
  "updatedAt": null,
  "updatedBy": null,
  "when": null,
  "then": null,
  "problems": null,
} satisfies SignalRuleDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


