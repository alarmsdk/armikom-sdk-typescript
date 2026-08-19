
# SmsLogEntryResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideNo` | number
`sideName` | string
`phone` | string
`smsText` | string
`sendDateUtc` | Date
`isSent` | boolean
`sideContactId` | string
`dealerId` | string
`traceId` | string
`smsRetryCount` | number
`smsNextRetryAtUtc` | Date
`smsLastError` | string

## Example

```typescript
import type { SmsLogEntryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideNo": null,
  "sideName": null,
  "phone": null,
  "smsText": null,
  "sendDateUtc": null,
  "isSent": null,
  "sideContactId": null,
  "dealerId": null,
  "traceId": null,
  "smsRetryCount": null,
  "smsNextRetryAtUtc": null,
  "smsLastError": null,
} satisfies SmsLogEntryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SmsLogEntryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


