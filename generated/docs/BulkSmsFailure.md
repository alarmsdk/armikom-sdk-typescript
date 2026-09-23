
# BulkSmsFailure

One subscriber the bulk SMS could not send to, and why.

## Properties

Name | Type
------------ | -------------
`sideId` | string
`sideNo` | number
`partNo` | number
`name` | string
`code` | string
`message` | string

## Example

```typescript
import type { BulkSmsFailure } from ''

// TODO: Update the object below with actual values
const example = {
  "sideId": null,
  "sideNo": null,
  "partNo": null,
  "name": null,
  "code": null,
  "message": null,
} satisfies BulkSmsFailure

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BulkSmsFailure
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


