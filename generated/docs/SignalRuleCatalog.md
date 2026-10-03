
# SignalRuleCatalog

What a rule may be written against in this monitoring center: its facts (built-in and from active metadata definitions), the operators each fact type accepts, and the actions. The console builds its condition editor from this, so a fact or action added to the pipeline reaches the editor without a frontend release.

## Properties

Name | Type
------------ | -------------
`facts` | [Array&lt;SignalRuleFactItem&gt;](SignalRuleFactItem.md)
`operators` | [Array&lt;SignalRuleOperatorItem&gt;](SignalRuleOperatorItem.md)
`actions` | [Array&lt;SignalRuleActionDescriptor&gt;](SignalRuleActionDescriptor.md)
`modes` | Array&lt;string&gt;

## Example

```typescript
import type { SignalRuleCatalog } from ''

// TODO: Update the object below with actual values
const example = {
  "facts": null,
  "operators": null,
  "actions": null,
  "modes": null,
} satisfies SignalRuleCatalog

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleCatalog
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


