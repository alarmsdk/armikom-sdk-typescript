
# SignalRuleCondition

A node of the condition tree. Exactly one of Armikom.Api.Contracts.Admin.SignalRuleCondition.All, Armikom.Api.Contracts.Admin.SignalRuleCondition.Any, Armikom.Api.Contracts.Admin.SignalRuleCondition.Not or Armikom.Api.Contracts.Admin.SignalRuleCondition.Fact is set; a leaf also carries Armikom.Api.Contracts.Admin.SignalRuleCondition.Op and, for every operator but `exists`, Armikom.Api.Contracts.Admin.SignalRuleCondition.Value.

## Properties

Name | Type
------------ | -------------
`all` | [Array&lt;SignalRuleCondition&gt;](SignalRuleCondition.md)
`any` | [Array&lt;SignalRuleCondition&gt;](SignalRuleCondition.md)
`not` | [SignalRuleCondition](SignalRuleCondition.md)
`fact` | string
`op` | string
`value` | any

## Example

```typescript
import type { SignalRuleCondition } from ''

// TODO: Update the object below with actual values
const example = {
  "all": null,
  "any": null,
  "not": null,
  "fact": null,
  "op": null,
  "value": null,
} satisfies SignalRuleCondition

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleCondition
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


