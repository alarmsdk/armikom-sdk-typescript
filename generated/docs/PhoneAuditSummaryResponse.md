
# PhoneAuditSummaryResponse

Summary of phone numbers across all entities.

## Properties

Name | Type
------------ | -------------
`entities` | [Array&lt;PhoneAuditEntitySummary&gt;](PhoneAuditEntitySummary.md)
`totalPhones` | number
`normalizedCount` | number
`needsNormalizationCount` | number
`shortCount` | number

## Example

```typescript
import type { PhoneAuditSummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "entities": null,
  "totalPhones": null,
  "normalizedCount": null,
  "needsNormalizationCount": null,
  "shortCount": null,
} satisfies PhoneAuditSummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PhoneAuditSummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


