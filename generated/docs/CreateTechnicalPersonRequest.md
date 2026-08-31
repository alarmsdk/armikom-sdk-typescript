
# CreateTechnicalPersonRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`phone1` | string
`phone2` | string
`phone3` | string
`mail` | string
`active` | boolean
`specialization` | string
`dealerId` | string
`password` | string

## Example

```typescript
import type { CreateTechnicalPersonRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "phone1": null,
  "phone2": null,
  "phone3": null,
  "mail": null,
  "active": null,
  "specialization": null,
  "dealerId": null,
  "password": null,
} satisfies CreateTechnicalPersonRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTechnicalPersonRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


