
# ImpersonateResponse

`POST /v1/auth/impersonate/{userId}` (D96): an access token for the target user. There is             no refresh token — keep the administrator\'s own tokens and go back to them when this expires.

## Properties

Name | Type
------------ | -------------
`accessToken` | string
`expiresAt` | Date
`shiftRestricted` | boolean
`user` | [UserInfo](UserInfo.md)
`impersonatedBy` | [ImpersonatorInfo](ImpersonatorInfo.md)

## Example

```typescript
import type { ImpersonateResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "accessToken": null,
  "expiresAt": null,
  "shiftRestricted": null,
  "user": null,
  "impersonatedBy": null,
} satisfies ImpersonateResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ImpersonateResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


