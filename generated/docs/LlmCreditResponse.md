
# LlmCreditResponse

Remaining AI credit and what was spent.

## Properties

Name | Type
------------ | -------------
`available` | boolean
`currency` | string
`remaining` | number
`spentToday` | number
`spentWeek` | number
`spentMonth` | number
`asOf` | Date

## Example

```typescript
import type { LlmCreditResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "available": null,
  "currency": null,
  "remaining": null,
  "spentToday": null,
  "spentWeek": null,
  "spentMonth": null,
  "asOf": null,
} satisfies LlmCreditResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LlmCreditResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


