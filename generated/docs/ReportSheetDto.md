
# ReportSheetDto


## Properties

Name | Type
------------ | -------------
`name` | string
`sql` | string
`maxRows` | number
`columns` | [Array&lt;ReportColumnLabelDto&gt;](ReportColumnLabelDto.md)

## Example

```typescript
import type { ReportSheetDto } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "sql": null,
  "maxRows": null,
  "columns": null,
} satisfies ReportSheetDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportSheetDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


