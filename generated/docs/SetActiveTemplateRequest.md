
# SetActiveTemplateRequest

Request for PUT /v1/ui-layout-templates/{screen}/active.

## Properties

Name | Type
------------ | -------------
`activeTemplateId` | string

## Example

```typescript
import type { SetActiveTemplateRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "activeTemplateId": null,
} satisfies SetActiveTemplateRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SetActiveTemplateRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


