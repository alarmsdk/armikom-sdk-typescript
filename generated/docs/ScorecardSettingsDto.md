
# ScorecardSettingsDto

Scorecard settings: thresholds, weights and limits (D89).

## Properties

Name | Type
------------ | -------------
`waitThresholds` | [Array&lt;ScorecardWaitThresholdDto&gt;](ScorecardWaitThresholdDto.md)
`defaultWaitSeconds` | number
`weights` | [ScorecardWeightsDto](ScorecardWeightsDto.md)
`taskNeglectFactor` | number
`breakAllowanceMinutes` | number
`sessionGapMinutes` | number
`taskActivityGapMinutes` | number

## Example

```typescript
import type { ScorecardSettingsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "waitThresholds": null,
  "defaultWaitSeconds": null,
  "weights": null,
  "taskNeglectFactor": null,
  "breakAllowanceMinutes": null,
  "sessionGapMinutes": null,
  "taskActivityGapMinutes": null,
} satisfies ScorecardSettingsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ScorecardSettingsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


