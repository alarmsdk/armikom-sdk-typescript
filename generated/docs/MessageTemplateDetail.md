
# MessageTemplateDetail

A stored SMS / mail / IVR text with `{Placeholder}`s. Templates are deployment-wide (every monitoring center). An `alarm` template may be scoped to an alarm category or a signal type; the most specific active one wins: signal type, alarm category, global, built-in default.

## Properties

Name | Type
------------ | -------------
`id` | string
`channel` | string
`kind` | string
`alarmCategoryId` | string
`alarmCategoryName` | string
`signalTypeId` | string
`signalTypeName` | string
`subject` | string
`body` | string
`isActive` | boolean
`createdDate` | Date
`updatedDate` | Date
`updatedBy` | string

## Example

```typescript
import type { MessageTemplateDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "channel": null,
  "kind": null,
  "alarmCategoryId": null,
  "alarmCategoryName": null,
  "signalTypeId": null,
  "signalTypeName": null,
  "subject": null,
  "body": null,
  "isActive": null,
  "createdDate": null,
  "updatedDate": null,
  "updatedBy": null,
} satisfies MessageTemplateDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MessageTemplateDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


