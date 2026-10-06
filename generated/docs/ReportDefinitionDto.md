
# ReportDefinitionDto

A saved report.

## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`description` | string
`visibility` | string
`tenantAware` | boolean
`ownerId` | string
`ownerName` | string
`isOwner` | boolean
`canManage` | boolean
`version` | number
`createdAt` | Date
`updatedAt` | Date
`definition` | [ReportDefinitionBody](ReportDefinitionBody.md)

## Example

```typescript
import type { ReportDefinitionDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "description": null,
  "visibility": null,
  "tenantAware": null,
  "ownerId": null,
  "ownerName": null,
  "isOwner": null,
  "canManage": null,
  "version": null,
  "createdAt": null,
  "updatedAt": null,
  "definition": null,
} satisfies ReportDefinitionDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportDefinitionDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


