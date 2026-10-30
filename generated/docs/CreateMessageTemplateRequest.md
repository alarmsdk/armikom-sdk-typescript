
# CreateMessageTemplateRequest


## Properties

Name | Type
------------ | -------------
`channel` | string
`kind` | string
`alarmCategoryId` | string
`signalTypeId` | string
`subject` | string
`body` | string
`isActive` | boolean

## Example

```typescript
import type { CreateMessageTemplateRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "channel": null,
  "kind": null,
  "alarmCategoryId": null,
  "signalTypeId": null,
  "subject": null,
  "body": null,
  "isActive": null,
} satisfies CreateMessageTemplateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateMessageTemplateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


