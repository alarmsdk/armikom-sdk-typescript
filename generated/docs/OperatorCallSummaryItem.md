
# OperatorCallSummaryItem


## Properties

Name | Type
------------ | -------------
`extension` | string
`operatorName` | string
`totalCalls` | number
`answeredCalls` | number
`missedCalls` | number
`totalDurationSeconds` | number
`totalTalkSeconds` | number

## Example

```typescript
import type { OperatorCallSummaryItem } from ''

// TODO: Update the object below with actual values
const example = {
  "extension": null,
  "operatorName": null,
  "totalCalls": null,
  "answeredCalls": null,
  "missedCalls": null,
  "totalDurationSeconds": null,
  "totalTalkSeconds": null,
} satisfies OperatorCallSummaryItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorCallSummaryItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


