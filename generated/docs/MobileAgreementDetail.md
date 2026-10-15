
# MobileAgreementDetail

An agreement a monitoring centre asks its customer-app users to accept after login. Mandatory agreements block the app until accepted; optional ones can be declined or postponed to the next login. Answers are recorded per Armikom.Api.Contracts.Admin.MobileAgreementDetail.Version.

## Properties

Name | Type
------------ | -------------
`id` | string
`monitoringCenterId` | string
`monitoringCenterName` | string
`title` | string
`content` | string
`url` | string
`isMandatory` | boolean
`isActive` | boolean
`sortOrder` | number
`version` | number
`createdDate` | Date
`updatedDate` | Date
`acceptedCount` | number
`declinedCount` | number

## Example

```typescript
import type { MobileAgreementDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "title": null,
  "content": null,
  "url": null,
  "isMandatory": null,
  "isActive": null,
  "sortOrder": null,
  "version": null,
  "createdDate": null,
  "updatedDate": null,
  "acceptedCount": null,
  "declinedCount": null,
} satisfies MobileAgreementDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileAgreementDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


