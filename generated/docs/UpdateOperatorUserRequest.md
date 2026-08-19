
# UpdateOperatorUserRequest


## Properties

Name | Type
------------ | -------------
`isActive` | boolean
`extension` | number
`soundAlertEnabled` | boolean
`monitoringCenterId` | string
`workScheduleId` | string

## Example

```typescript
import type { UpdateOperatorUserRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "isActive": null,
  "extension": null,
  "soundAlertEnabled": null,
  "monitoringCenterId": null,
  "workScheduleId": null,
} satisfies UpdateOperatorUserRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateOperatorUserRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


