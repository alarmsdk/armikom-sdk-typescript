
# SmsSettingDetail

A named SMS gateway profile scoped to a monitoring centre.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`smsUser` | string
`smsPrefix` | string
`smsOrg` | string
`provider` | number
`monitoringCenterId` | string
`hasPassword` | boolean

## Example

```typescript
import type { SmsSettingDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "smsUser": null,
  "smsPrefix": null,
  "smsOrg": null,
  "provider": null,
  "monitoringCenterId": null,
  "hasPassword": null,
} satisfies SmsSettingDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SmsSettingDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


