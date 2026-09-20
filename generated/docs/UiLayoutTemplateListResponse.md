
# UiLayoutTemplateListResponse

Response for GET /v1/ui-layout-templates/{screen} (pool listing).

## Properties

Name | Type
------------ | -------------
`screen` | string
`items` | [Array&lt;UiLayoutTemplateItem&gt;](UiLayoutTemplateItem.md)
`activeTemplateId` | string

## Example

```typescript
import type { UiLayoutTemplateListResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "screen": null,
  "items": null,
  "activeTemplateId": null,
} satisfies UiLayoutTemplateListResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UiLayoutTemplateListResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


