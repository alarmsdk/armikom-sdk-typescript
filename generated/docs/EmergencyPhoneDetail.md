
# EmergencyPhoneDetail

A shared emergency contact (police, fire, ambulance) shown to operators.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`phone1` | string
`phone2` | string
`phone3` | string
`email` | string

## Example

```typescript
import type { EmergencyPhoneDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "phone1": null,
  "phone2": null,
  "phone3": null,
  "email": null,
} satisfies EmergencyPhoneDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EmergencyPhoneDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


