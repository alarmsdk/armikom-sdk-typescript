
# MessageTemplatePreview

A template rendered with example values.

## Properties

Name | Type
------------ | -------------
`subject` | string
`body` | string
`length` | number
`unicode` | boolean
`segments` | number
`errors` | Array&lt;string&gt;

## Example

```typescript
import type { MessageTemplatePreview } from ''

// TODO: Update the object below with actual values
const example = {
  "subject": null,
  "body": null,
  "length": null,
  "unicode": null,
  "segments": null,
  "errors": null,
} satisfies MessageTemplatePreview

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MessageTemplatePreview
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


