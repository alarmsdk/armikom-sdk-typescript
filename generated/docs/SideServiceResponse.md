
# SideServiceResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`serviceTypeId` | string
`serviceCompanyId` | string
`servicePersonId` | string
`completedById` | string
`requestedById` | string
`status` | string
`priority` | string
`plannedDate` | Date
`startDate` | Date
`endDate` | Date
`completedDate` | Date
`recordDate` | Date
`estimatedDurationMinutes` | number
`actualDurationMinutes` | number
`statement` | string
`cancelReason` | string
`active` | boolean
`customerRating` | number
`customerFeedback` | string
`feedbackDate` | Date
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { SideServiceResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "serviceTypeId": null,
  "serviceCompanyId": null,
  "servicePersonId": null,
  "completedById": null,
  "requestedById": null,
  "status": null,
  "priority": null,
  "plannedDate": null,
  "startDate": null,
  "endDate": null,
  "completedDate": null,
  "recordDate": null,
  "estimatedDurationMinutes": null,
  "actualDurationMinutes": null,
  "statement": null,
  "cancelReason": null,
  "active": null,
  "customerRating": null,
  "customerFeedback": null,
  "feedbackDate": null,
  "sideEffects": null,
} satisfies SideServiceResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideServiceResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


