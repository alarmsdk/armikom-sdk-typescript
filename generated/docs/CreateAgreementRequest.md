
# CreateAgreementRequest


## Properties

Name | Type
------------ | -------------
`paymentPeriod` | string
`startDate` | Date
`endDate` | Date
`accountItemId` | string
`amount` | number

## Example

```typescript
import type { CreateAgreementRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "paymentPeriod": null,
  "startDate": null,
  "endDate": null,
  "accountItemId": null,
  "amount": null,
} satisfies CreateAgreementRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateAgreementRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


