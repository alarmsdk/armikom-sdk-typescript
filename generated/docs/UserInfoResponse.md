
# UserInfoResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`type` | string
`monitoringCenterId` | string
`monitoringCenterName` | string
`dealerId` | string
`dealerName` | string
`extension` | string
`scopes` | Array&lt;string&gt;

## Example

```typescript
import type { UserInfoResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "type": null,
  "monitoringCenterId": null,
  "monitoringCenterName": null,
  "dealerId": null,
  "dealerName": null,
  "extension": null,
  "scopes": null,
} satisfies UserInfoResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UserInfoResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


