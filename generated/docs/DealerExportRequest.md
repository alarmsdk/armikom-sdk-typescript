
# DealerExportRequest

Exports what the dealer list shows: the same free-text, status and centre criteria.

## Properties

Name | Type
------------ | -------------
`query` | string
`active` | boolean
`monitoringCenterId` | string
`sort` | string
`format` | string
`timeZone` | string

## Example

```typescript
import type { DealerExportRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "query": null,
  "active": null,
  "monitoringCenterId": null,
  "sort": null,
  "format": null,
  "timeZone": null,
} satisfies DealerExportRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DealerExportRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


