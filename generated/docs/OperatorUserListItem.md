
# OperatorUserListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`userName` | string
`isActive` | boolean
`extension` | number
`soundAlertEnabled` | boolean
`monitoringCenterId` | string
`workScheduleId` | string
`accessFailedCount` | number
`lockedUntil` | Date
`isLocked` | boolean
`roleNames` | Array&lt;string&gt;

## Example

```typescript
import type { OperatorUserListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "userName": null,
  "isActive": null,
  "extension": null,
  "soundAlertEnabled": null,
  "monitoringCenterId": null,
  "workScheduleId": null,
  "accessFailedCount": null,
  "lockedUntil": null,
  "isLocked": null,
  "roleNames": null,
} satisfies OperatorUserListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OperatorUserListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


