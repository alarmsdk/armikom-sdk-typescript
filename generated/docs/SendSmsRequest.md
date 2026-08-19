
# SendSmsRequest


## Properties

Name | Type
------------ | -------------
`text` | string
`recipients` | string
`phones` | Array&lt;string&gt;
`contactIds` | Array&lt;string&gt;
`note` | string
`recall` | boolean

## Example

```typescript
import type { SendSmsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "recipients": null,
  "phones": null,
  "contactIds": null,
  "note": null,
  "recall": null,
} satisfies SendSmsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SendSmsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


