
# SmsTemplateResponse


## Properties

Name | Type
------------ | -------------
`text` | string
`timeZone` | string
`contacts` | [Array&lt;SmsTemplateContact&gt;](SmsTemplateContact.md)
`preselected` | boolean

## Example

```typescript
import type { SmsTemplateResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "timeZone": null,
  "contacts": null,
  "preselected": null,
} satisfies SmsTemplateResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SmsTemplateResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


