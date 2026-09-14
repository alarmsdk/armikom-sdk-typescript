
# OperatorDataEntryItem


## Properties

Name | Type
------------ | -------------
`operatorId` | string
`operatorName` | string
`actionTextsWritten` | number
`totalActionTextLength` | number
`sidesCreated` | number
`sidesApproved` | number
`auditedWriteOperations` | number

## Example

```typescript
import type { OperatorDataEntryItem } from ''

// TODO: Update the object below with actual values
const example = {
  "operatorId": null,
  "operatorName": null,
  "actionTextsWritten": null,
  "totalActionTextLength": null,
  "sidesCreated": null,
  "sidesApproved": null,
  "auditedWriteOperations": null,
} satisfies OperatorDataEntryItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorDataEntryItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


