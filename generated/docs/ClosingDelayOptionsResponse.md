
# ClosingDelayOptionsResponse


## Properties

Name | Type
------------ | -------------
`hasTimeTable` | boolean
`availableModes` | Array&lt;string&gt;
`suggestedBaseTime` | Date
`todayClosingTime` | string

## Example

```typescript
import type { ClosingDelayOptionsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "hasTimeTable": null,
  "availableModes": null,
  "suggestedBaseTime": null,
  "todayClosingTime": null,
} satisfies ClosingDelayOptionsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClosingDelayOptionsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


