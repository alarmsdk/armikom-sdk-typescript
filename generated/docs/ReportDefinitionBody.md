
# ReportDefinitionBody

A reusable report: parameterised SQL sheets plus the parameters a user fills in.

## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`parameters` | [Array&lt;ReportParameterDto&gt;](ReportParameterDto.md)
`sheets` | [Array&lt;ReportSheetDto&gt;](ReportSheetDto.md)

## Example

```typescript
import type { ReportDefinitionBody } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "description": null,
  "parameters": null,
  "sheets": null,
} satisfies ReportDefinitionBody

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportDefinitionBody
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


