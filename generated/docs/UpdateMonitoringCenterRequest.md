
# UpdateMonitoringCenterRequest

PATCH body. A property left null is not written — so omitting a password keeps  the stored one. Sending an empty string clears the stored secret.

## Properties

Name | Type
------------ | -------------
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
`smsPassword` | string
`smsOrganization` | string
`smsMessageType` | string
`mailHost` | string
`mailPort` | number
`mailUser` | string
`mailPassword` | string
`mailSender` | string
`mailSenderTitle` | string
`mailSsl` | boolean
`pbxIp` | string
`pbxPort` | number
`pbxUsername` | string
`pbxPassword` | string
`pbxZone` | string
`fcmProjectId` | string
`fcmApiKey` | string
`fcmAndroidAppId` | string
`fcmIosAppId` | string
`fcmMessagingSenderId` | string
`fcmStorageBucket` | string
`fcmDatabaseUrl` | string

## Example

```typescript
import type { UpdateMonitoringCenterRequest } from ''

// TODO: Update the object below with actual values
const example = {
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
  "smsPassword": null,
  "smsOrganization": null,
  "smsMessageType": null,
  "mailHost": null,
  "mailPort": null,
  "mailUser": null,
  "mailPassword": null,
  "mailSender": null,
  "mailSenderTitle": null,
  "mailSsl": null,
  "pbxIp": null,
  "pbxPort": null,
  "pbxUsername": null,
  "pbxPassword": null,
  "pbxZone": null,
  "fcmProjectId": null,
  "fcmApiKey": null,
  "fcmAndroidAppId": null,
  "fcmIosAppId": null,
  "fcmMessagingSenderId": null,
  "fcmStorageBucket": null,
  "fcmDatabaseUrl": null,
} satisfies UpdateMonitoringCenterRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateMonitoringCenterRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


