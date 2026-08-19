
# CreateOperatorUserRequest


## Properties

Name | Type
------------ | -------------
`userName` | string
`password` | string
`isActive` | boolean
`extension` | number
`soundAlertEnabled` | boolean
`monitoringCenterId` | string
`workScheduleId` | string
`roleIds` | Array&lt;string&gt;

## Example

```typescript
import type { CreateOperatorUserRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "userName": null,
  "password": null,
  "isActive": null,
  "extension": null,
  "soundAlertEnabled": null,
  "monitoringCenterId": null,
  "workScheduleId": null,
  "roleIds": null,
} satisfies CreateOperatorUserRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateOperatorUserRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


