
# ReportPreviewCardDto


## Properties

Name | Type
------------ | -------------
`previewId` | string
`title` | string
`sql` | string
`parameters` | [Array&lt;ReportParameterDto&gt;](ReportParameterDto.md)
`values` | { [key: string]: any | undefined | null; }
`resolvedParameters` | { [key: string]: any | undefined | null; }
`columns` | [Array&lt;ReportColumnDto&gt;](ReportColumnDto.md)
`rows` | Array&lt;Array&lt;any&gt;&gt;
`rowCount` | number
`truncated` | boolean
`errors` | Array&lt;string&gt;
`warnings` | Array&lt;string&gt;

## Example

```typescript
import type { ReportPreviewCardDto } from ''

// TODO: Update the object below with actual values
const example = {
  "previewId": null,
  "title": null,
  "sql": null,
  "parameters": null,
  "values": null,
  "resolvedParameters": null,
  "columns": null,
  "rows": null,
  "rowCount": null,
  "truncated": null,
  "errors": null,
  "warnings": null,
} satisfies ReportPreviewCardDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportPreviewCardDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


