
# LinkMobileUserRequest

Body for `POST /v1/sides/{sideId}/mobile-users`.  Supply Armikom.Api.Contracts.MobileUsers.LinkMobileUserRequest.MobileUserId to link an existing user,  or Armikom.Api.Contracts.MobileUsers.LinkMobileUserRequest.Name/Armikom.Api.Contracts.MobileUsers.LinkMobileUserRequest.Phone/Armikom.Api.Contracts.MobileUsers.LinkMobileUserRequest.Password to create-and-link.  Supplying both is rejected as ambiguous.

## Properties

Name | Type
------------ | -------------
`mobileUserId` | string
`name` | string
`phone` | string
`password` | string

## Example

```typescript
import type { LinkMobileUserRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "mobileUserId": null,
  "name": null,
  "phone": null,
  "password": null,
} satisfies LinkMobileUserRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LinkMobileUserRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


