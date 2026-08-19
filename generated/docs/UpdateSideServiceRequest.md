
# UpdateSideServiceRequest


## Properties

Name | Type
------------ | -------------
`serviceTypeId` | string
`serviceCompanyId` | string
`servicePersonId` | string
`completedById` | string
`requestedById` | string
`priority` | string
`plannedDate` | Date
`estimatedDurationMinutes` | number
`actualDurationMinutes` | number
`statement` | string

## Example

```typescript
import type { UpdateSideServiceRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "serviceTypeId": null,
  "serviceCompanyId": null,
  "servicePersonId": null,
  "completedById": null,
  "requestedById": null,
  "priority": null,
  "plannedDate": null,
  "estimatedDurationMinutes": null,
  "actualDurationMinutes": null,
  "statement": null,
} satisfies UpdateSideServiceRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateSideServiceRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


