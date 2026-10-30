
# UpdateMessageTemplateRequest

Omitted fields keep their value. Channel, kind and scope cannot change.

## Properties

Name | Type
------------ | -------------
`subject` | string
`body` | string
`isActive` | boolean

## Example

```typescript
import type { UpdateMessageTemplateRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "subject": null,
  "body": null,
  "isActive": null,
} satisfies UpdateMessageTemplateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateMessageTemplateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


