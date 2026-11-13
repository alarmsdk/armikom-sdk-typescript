
# LlmSettingsResponse

Which model each AI task uses, and the models on offer (D90).

## Properties

Name | Type
------------ | -------------
`enabled` | boolean
`currency` | string
`tasks` | [Array&lt;LlmTaskSettingDto&gt;](LlmTaskSettingDto.md)
`models` | [Array&lt;LlmModelDto&gt;](LlmModelDto.md)

## Example

```typescript
import type { LlmSettingsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "enabled": null,
  "currency": null,
  "tasks": null,
  "models": null,
} satisfies LlmSettingsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LlmSettingsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


