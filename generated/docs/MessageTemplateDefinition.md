
# MessageTemplateDefinition

A (channel, kind) pair that can have a template, with its placeholders and default text.

## Properties

Name | Type
------------ | -------------
`channel` | string
`kind` | string
`supportsOverrides` | boolean
`defaultSubject` | string
`defaultBody` | string
`placeholders` | [Array&lt;MessageTemplatePlaceholder&gt;](MessageTemplatePlaceholder.md)

## Example

```typescript
import type { MessageTemplateDefinition } from ''

// TODO: Update the object below with actual values
const example = {
  "channel": null,
  "kind": null,
  "supportsOverrides": null,
  "defaultSubject": null,
  "defaultBody": null,
  "placeholders": null,
} satisfies MessageTemplateDefinition

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MessageTemplateDefinition
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


