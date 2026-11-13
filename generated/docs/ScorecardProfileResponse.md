
# ScorecardProfileResponse

The settings in force for a centre and where they come from.

## Properties

Name | Type
------------ | -------------
`monitoringCenterId` | string
`source` | string
`settings` | [ScorecardSettingsDto](ScorecardSettingsDto.md)
`updatedAt` | Date
`updatedBy` | string

## Example

```typescript
import type { ScorecardProfileResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "monitoringCenterId": null,
  "source": null,
  "settings": null,
  "updatedAt": null,
  "updatedBy": null,
} satisfies ScorecardProfileResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ScorecardProfileResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


