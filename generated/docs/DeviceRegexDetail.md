
# DeviceRegexDetail

A named parser for one device family. The Engine applies Armikom.Api.Contracts.Admin.DeviceRegexDetail.RegexText  to the raw packet, so a malformed pattern silently stops signal ingestion —  the API validates it before storing.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`regexText` | string
`subRegex` | string
`delimiter` | string
`receiverCount` | number

## Example

```typescript
import type { DeviceRegexDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "regexText": null,
  "subRegex": null,
  "delimiter": null,
  "receiverCount": null,
} satisfies DeviceRegexDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeviceRegexDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


