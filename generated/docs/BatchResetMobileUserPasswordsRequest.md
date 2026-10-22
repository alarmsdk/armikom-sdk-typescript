
# BatchResetMobileUserPasswordsRequest

Body for `POST /v1/mobile-users/batch-password-reset`: give many mobile users a new, server-generated password each and text it to them. Name the users either by Armikom.Api.Contracts.MobileUsers.BatchResetMobileUserPasswordsRequest.MobileUserIds (ticked rows) or by Armikom.Api.Contracts.MobileUsers.BatchResetMobileUserPasswordsRequest.Filter (the whole list search).

## Properties

Name | Type
------------ | -------------
`mobileUserIds` | Array&lt;string&gt;
`filter` | [MobileUserBatchFilter](MobileUserBatchFilter.md)
`expectedCount` | number
`smsText` | string

## Example

```typescript
import type { BatchResetMobileUserPasswordsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "mobileUserIds": null,
  "filter": null,
  "expectedCount": null,
  "smsText": null,
} satisfies BatchResetMobileUserPasswordsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BatchResetMobileUserPasswordsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


