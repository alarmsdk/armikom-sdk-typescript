
# MonitoringCenterDetail

A monitoring centre with its infrastructure configuration.  Secrets are never returned: each credential is reported as a  `has…` boolean so the console can show \"configured / not configured\"  without ever holding the value.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`phone1` | string
`phone2` | string
`address` | string
`email` | string
`countryId` | string
`cityId` | string
`districtId` | string
`geolocation` | string
`timeZone` | string
`prefix` | string
`sideNoStart` | number
`sideNoEnd` | number
`soundPath` | string
`defaultSound` | string
`smsProviderType` | string
`smsUsername` | string
`smsOrganization` | string
`smsMessageType` | string
`hasSmsPassword` | boolean
`mailHost` | string
`mailPort` | number
`mailUser` | string
`mailSender` | string
`mailSenderTitle` | string
`mailSsl` | boolean
`hasMailPassword` | boolean
`pbxIp` | string
`pbxPort` | number
`pbxUsername` | string
`pbxZone` | string
`hasPbxPassword` | boolean
`fcmProjectId` | string
`fcmAndroidAppId` | string
`fcmIosAppId` | string
`fcmMessagingSenderId` | string
`fcmStorageBucket` | string
`fcmDatabaseUrl` | string
`hasFcmApiKey` | boolean

## Example

```typescript
import type { MonitoringCenterDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "phone1": null,
  "phone2": null,
  "address": null,
  "email": null,
  "countryId": null,
  "cityId": null,
  "districtId": null,
  "geolocation": null,
  "timeZone": null,
  "prefix": null,
  "sideNoStart": null,
  "sideNoEnd": null,
  "soundPath": null,
  "defaultSound": null,
  "smsProviderType": null,
  "smsUsername": null,
  "smsOrganization": null,
  "smsMessageType": null,
  "hasSmsPassword": null,
  "mailHost": null,
  "mailPort": null,
  "mailUser": null,
  "mailSender": null,
  "mailSenderTitle": null,
  "mailSsl": null,
  "hasMailPassword": null,
  "pbxIp": null,
  "pbxPort": null,
  "pbxUsername": null,
  "pbxZone": null,
  "hasPbxPassword": null,
  "fcmProjectId": null,
  "fcmAndroidAppId": null,
  "fcmIosAppId": null,
  "fcmMessagingSenderId": null,
  "fcmStorageBucket": null,
  "fcmDatabaseUrl": null,
  "hasFcmApiKey": null,
} satisfies MonitoringCenterDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MonitoringCenterDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


