
# MobileUserBatchFilter

The same criteria `GET /v1/mobile-users` takes.

## Properties

Name | Type
------------ | -------------
`q` | string
`monitoringCenterId` | string

## Example

```typescript
import type { MobileUserBatchFilter } from ''

// TODO: Update the object below with actual values
const example = {
  "q": null,
  "monitoringCenterId": null,
} satisfies MobileUserBatchFilter

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileUserBatchFilter
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


