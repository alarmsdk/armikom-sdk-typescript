
# OperatorComparisonItem


## Properties

Name | Type
------------ | -------------
`operatorId` | string
`operatorName` | string
`completed` | number
`quickCompleted` | number
`batchCompleted` | number
`totalHandled` | number
`totalCalls` | number
`answeredCalls` | number
`totalTalkSeconds` | number
`actionTextsWritten` | number
`totalActionTextLength` | number
`sidesCreated` | number
`totalDwellSeconds` | number
`totalIdleSeconds` | number
`activeSeconds` | number
`sessionCount` | number

## Example

```typescript
import type { OperatorComparisonItem } from ''

// TODO: Update the object below with actual values
const example = {
  "operatorId": null,
  "operatorName": null,
  "completed": null,
  "quickCompleted": null,
  "batchCompleted": null,
  "totalHandled": null,
  "totalCalls": null,
  "answeredCalls": null,
  "totalTalkSeconds": null,
  "actionTextsWritten": null,
  "totalActionTextLength": null,
  "sidesCreated": null,
  "totalDwellSeconds": null,
  "totalIdleSeconds": null,
  "activeSeconds": null,
  "sessionCount": null,
} satisfies OperatorComparisonItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorComparisonItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


