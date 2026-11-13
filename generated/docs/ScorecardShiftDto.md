
# ScorecardShiftDto

A shift the operator scorecard is cut by, in the centre\'s local time (D89).

## Properties

Name | Type
------------ | -------------
`id` | string
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
import type { ScorecardShiftDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "monitoringCenterId": null,
  "name": null,
  "start": null,
  "end": null,
  "days": null,
  "validFrom": null,
  "validTo": null,
  "isActive": null,
} satisfies ScorecardShiftDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ScorecardShiftDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


