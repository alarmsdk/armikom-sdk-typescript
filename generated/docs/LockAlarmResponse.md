
# LockAlarmResponse


## Properties

Name | Type
------------ | -------------
`alarmEventId` | string
`sideId` | string
`lockedByUserId` | string
`lockedByUserName` | string
`lockedAtUtc` | Date
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { LockAlarmResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "alarmEventId": null,
  "sideId": null,
  "lockedByUserId": null,
  "lockedByUserName": null,
  "lockedAtUtc": null,
  "sideEffects": null,
} satisfies LockAlarmResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LockAlarmResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


