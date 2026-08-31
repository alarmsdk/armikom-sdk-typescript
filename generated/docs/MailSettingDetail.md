
# MailSettingDetail

A named SMTP profile scoped to a monitoring centre. The password is never  returned — Armikom.Api.Contracts.Admin.MailSettingDetail.HasPassword reports whether one is stored.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`mailHost` | string
`mailPort` | number
`mailUser` | string
`mailSender` | string
`monitoringCenterId` | string
`hasPassword` | boolean

## Example

```typescript
import type { MailSettingDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "mailHost": null,
  "mailPort": null,
  "mailUser": null,
  "mailSender": null,
  "monitoringCenterId": null,
  "hasPassword": null,
} satisfies MailSettingDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MailSettingDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


