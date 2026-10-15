
# UpdateMobileAgreementRequest

PATCH body — omitted fields keep their value.

## Properties

Name | Type
------------ | -------------
`title` | string
`content` | string
`url` | string
`isMandatory` | boolean
`isActive` | boolean
`sortOrder` | number
`requireReacceptance` | boolean

## Example

```typescript
import type { UpdateMobileAgreementRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "content": null,
  "url": null,
  "isMandatory": null,
  "isActive": null,
  "sortOrder": null,
  "requireReacceptance": null,
} satisfies UpdateMobileAgreementRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateMobileAgreementRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


