
# CreateAccountTypeRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`code` | string
`callType` | number
`sms` | boolean
`ivr` | boolean
`price` | number

## Example

```typescript
import type { CreateAccountTypeRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "code": null,
  "callType": null,
  "sms": null,
  "ivr": null,
  "price": null,
} satisfies CreateAccountTypeRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateAccountTypeRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


