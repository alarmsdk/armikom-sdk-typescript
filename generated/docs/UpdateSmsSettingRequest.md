
# UpdateSmsSettingRequest

PATCH body — omitting `smsPassword` keeps the stored one; an empty string clears it.

## Properties

Name | Type
------------ | -------------
`name` | string
`smsUser` | string
`smsPassword` | string
`smsPrefix` | string
`smsOrg` | string
`provider` | number
`monitoringCenterId` | string

## Example

```typescript
import type { UpdateSmsSettingRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "smsUser": null,
  "smsPassword": null,
  "smsPrefix": null,
  "smsOrg": null,
  "provider": null,
  "monitoringCenterId": null,
} satisfies UpdateSmsSettingRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateSmsSettingRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


