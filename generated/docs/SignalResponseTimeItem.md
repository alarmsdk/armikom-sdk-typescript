
# SignalResponseTimeItem


## Properties

Name | Type
------------ | -------------
`correlationId` | string
`operatorId` | string
`operatorName` | string
`sideNo` | number
`signalName` | string
`queuedAt` | Date
`firstViewedAt` | Date
`lockedAt` | Date
`completedAt` | Date
`queueToViewSeconds` | number
`viewToLockSeconds` | number
`lockToCompleteSeconds` | number
`queueToCompleteSeconds` | number

## Example

```typescript
import type { SignalResponseTimeItem } from ''

// TODO: Update the object below with actual values
const example = {
  "correlationId": null,
  "operatorId": null,
  "operatorName": null,
  "sideNo": null,
  "signalName": null,
  "queuedAt": null,
  "firstViewedAt": null,
  "lockedAt": null,
  "completedAt": null,
  "queueToViewSeconds": null,
  "viewToLockSeconds": null,
  "lockToCompleteSeconds": null,
  "queueToCompleteSeconds": null,
} satisfies SignalResponseTimeItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalResponseTimeItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


