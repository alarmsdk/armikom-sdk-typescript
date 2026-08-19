
# TableHashResult


## Properties

Name | Type
------------ | -------------
`totalRows` | number
`alreadyHashed` | number
`plaintextBefore` | number
`skippedNullOrEmpty` | number
`converted` | number
`plaintextAfter` | number

## Example

```typescript
import type { TableHashResult } from ''

// TODO: Update the object below with actual values
const example = {
  "totalRows": null,
  "alreadyHashed": null,
  "plaintextBefore": null,
  "skippedNullOrEmpty": null,
  "converted": null,
  "plaintextAfter": null,
} satisfies TableHashResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TableHashResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


