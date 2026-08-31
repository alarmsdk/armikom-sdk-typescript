
# CreateMailSettingRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`mailHost` | string
`mailPort` | number
`mailUser` | string
`mailPassword` | string
`mailSender` | string
`monitoringCenterId` | string

## Example

```typescript
import type { CreateMailSettingRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "mailHost": null,
  "mailPort": null,
  "mailUser": null,
  "mailPassword": null,
  "mailSender": null,
  "monitoringCenterId": null,
} satisfies CreateMailSettingRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateMailSettingRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


