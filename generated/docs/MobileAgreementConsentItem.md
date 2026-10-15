
# MobileAgreementConsentItem

One user\'s answer to one version of an agreement — the consent audit trail.

## Properties

Name | Type
------------ | -------------
`id` | string
`mobileUserId` | string
`mobileUserName` | string
`mobileUserPhone` | string
`version` | number
`status` | string
`date` | Date
`deviceId` | string
`platform` | string
`appVersion` | string
`ipAddress` | string

## Example

```typescript
import type { MobileAgreementConsentItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "mobileUserId": null,
  "mobileUserName": null,
  "mobileUserPhone": null,
  "version": null,
  "status": null,
  "date": null,
  "deviceId": null,
  "platform": null,
  "appVersion": null,
  "ipAddress": null,
} satisfies MobileAgreementConsentItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileAgreementConsentItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


