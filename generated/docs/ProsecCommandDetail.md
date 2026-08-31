
# ProsecCommandDetail

A queued panel command. Rows are consumed by the panel when it next polls,  which stamps Armikom.Api.Contracts.Admin.ProsecCommandDetail.SentAt; a row past Armikom.Api.Contracts.Admin.ProsecCommandDetail.ValidUntil is dropped.

## Properties

Name | Type
------------ | -------------
`id` | string
`monitoringCenterId` | string
`sideId` | string
`sideNo` | number
`command` | string
`createdAt` | Date
`validUntil` | Date
`sentAt` | Date

## Example

```typescript
import type { ProsecCommandDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "monitoringCenterId": null,
  "sideId": null,
  "sideNo": null,
  "command": null,
  "createdAt": null,
  "validUntil": null,
  "sentAt": null,
} satisfies ProsecCommandDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ProsecCommandDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


