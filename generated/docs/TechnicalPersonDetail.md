
# TechnicalPersonDetail

A field technician belonging to a dealer. The password is never returned —  Armikom.Api.Contracts.Admin.TechnicalPersonDetail.HasPassword reports whether one is stored.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`phone1` | string
`phone2` | string
`phone3` | string
`mail` | string
`active` | boolean
`specialization` | string
`dealerId` | string
`dealerName` | string
`hasPassword` | boolean

## Example

```typescript
import type { TechnicalPersonDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "phone1": null,
  "phone2": null,
  "phone3": null,
  "mail": null,
  "active": null,
  "specialization": null,
  "dealerId": null,
  "dealerName": null,
  "hasPassword": null,
} satisfies TechnicalPersonDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TechnicalPersonDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


