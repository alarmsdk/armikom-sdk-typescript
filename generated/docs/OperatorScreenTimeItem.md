
# OperatorScreenTimeItem


## Properties

Name | Type
------------ | -------------
`operatorId` | string
`operatorName` | string
`totalDwellSeconds` | number
`totalIdleSeconds` | number
`activeSeconds` | number
`sessionCount` | number

## Example

```typescript
import type { OperatorScreenTimeItem } from ''

// TODO: Update the object below with actual values
const example = {
  "operatorId": null,
  "operatorName": null,
  "totalDwellSeconds": null,
  "totalIdleSeconds": null,
  "activeSeconds": null,
  "sessionCount": null,
} satisfies OperatorScreenTimeItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorScreenTimeItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


