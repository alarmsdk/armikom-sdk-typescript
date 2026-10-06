
# ReportSheetResultDto


## Properties

Name | Type
------------ | -------------
`name` | string
`columns` | [Array&lt;ReportColumnDto&gt;](ReportColumnDto.md)
`rows` | Array&lt;Array&lt;any&gt;&gt;
`rowCount` | number
`truncated` | boolean
`error` | string
`elapsedMs` | number

## Example

```typescript
import type { ReportSheetResultDto } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "columns": null,
  "rows": null,
  "rowCount": null,
  "truncated": null,
  "error": null,
  "elapsedMs": null,
} satisfies ReportSheetResultDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportSheetResultDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


