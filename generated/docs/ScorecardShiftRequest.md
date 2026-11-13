
# ScorecardShiftRequest

Create or replace a shift.

## Properties

Name | Type
------------ | -------------
`monitoringCenterId` | string
`name` | string
`start` | string
`end` | string
`days` | Array&lt;number&gt;
`validFrom` | string
`validTo` | string
`isActive` | boolean

## Example

```typescript
import type { ScorecardShiftRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "monitoringCenterId": null,
  "name": null,
  "start": null,
  "end": null,
  "days": null,
  "validFrom": null,
  "validTo": null,
  "isActive": null,
} satisfies ScorecardShiftRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ScorecardShiftRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


