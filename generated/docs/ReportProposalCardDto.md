
# ReportProposalCardDto


## Properties

Name | Type
------------ | -------------
`proposalId` | string
`definition` | [ReportDefinitionBody](ReportDefinitionBody.md)
`tenantAware` | boolean
`warnings` | Array&lt;string&gt;
`resolvedDefaults` | { [key: string]: any | undefined | null; }
`sample` | [Array&lt;ReportSheetResultDto&gt;](ReportSheetResultDto.md)
`savedReportId` | string

## Example

```typescript
import type { ReportProposalCardDto } from ''

// TODO: Update the object below with actual values
const example = {
  "proposalId": null,
  "definition": null,
  "tenantAware": null,
  "warnings": null,
  "resolvedDefaults": null,
  "sample": null,
  "savedReportId": null,
} satisfies ReportProposalCardDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportProposalCardDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


