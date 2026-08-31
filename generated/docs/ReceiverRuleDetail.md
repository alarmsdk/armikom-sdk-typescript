
# ReceiverRuleDetail

An explicit admission rule for one receiver: either a side number or a source IP,  with the decision to allow or reject it. Read by the Engine on every event.

## Properties

Name | Type
------------ | -------------
`id` | string
`receiverId` | string
`sideNo` | number
`ipAddress` | string
`allow` | number

## Example

```typescript
import type { ReceiverRuleDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "receiverId": null,
  "sideNo": null,
  "ipAddress": null,
  "allow": null,
} satisfies ReceiverRuleDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReceiverRuleDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


