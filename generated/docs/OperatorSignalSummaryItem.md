
# OperatorSignalSummaryItem


## Properties

Name | Type
------------ | -------------
`operatorId` | string
`operatorName` | string
`completed` | number
`quickCompleted` | number
`batchCompleted` | number
`batchDelayed` | number
`locksForced` | number
`locksDenied` | number
`alarmsViewed` | number
`total` | number

## Example

```typescript
import type { OperatorSignalSummaryItem } from ''

// TODO: Update the object below with actual values
const example = {
  "operatorId": null,
  "operatorName": null,
  "completed": null,
  "quickCompleted": null,
  "batchCompleted": null,
  "batchDelayed": null,
  "locksForced": null,
  "locksDenied": null,
  "alarmsViewed": null,
  "total": null,
} satisfies OperatorSignalSummaryItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorSignalSummaryItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


