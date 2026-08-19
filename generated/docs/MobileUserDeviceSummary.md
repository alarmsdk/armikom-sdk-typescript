
# MobileUserDeviceSummary


## Properties

Name | Type
------------ | -------------
`deviceId` | string
`deviceName` | string
`platform` | string
`isActive` | boolean
`lastLoginDate` | Date

## Example

```typescript
import type { MobileUserDeviceSummary } from ''

// TODO: Update the object below with actual values
const example = {
  "deviceId": null,
  "deviceName": null,
  "platform": null,
  "isActive": null,
  "lastLoginDate": null,
} satisfies MobileUserDeviceSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileUserDeviceSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


