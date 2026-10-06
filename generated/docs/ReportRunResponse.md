
# ReportRunResponse


## Properties

Name | Type
------------ | -------------
`sheets` | [Array&lt;ReportSheetResultDto&gt;](ReportSheetResultDto.md)
`resolvedParameters` | { [key: string]: any | undefined | null; }
`warnings` | Array&lt;string&gt;

## Example

```typescript
import type { ReportRunResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "sheets": null,
  "resolvedParameters": null,
  "warnings": null,
} satisfies ReportRunResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportRunResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


