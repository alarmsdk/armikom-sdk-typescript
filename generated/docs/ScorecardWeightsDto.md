
# ScorecardWeightsDto

Relative weights of the score\'s components (0–100 each; they need not add up to 100).

## Properties

Name | Type
------------ | -------------
`responsiveness` | number
`efficiency` | number
`discipline` | number
`volume` | number
`tasks` | number

## Example

```typescript
import type { ScorecardWeightsDto } from ''

// TODO: Update the object below with actual values
const example = {
  "responsiveness": null,
  "efficiency": null,
  "discipline": null,
  "volume": null,
  "tasks": null,
} satisfies ScorecardWeightsDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ScorecardWeightsDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


