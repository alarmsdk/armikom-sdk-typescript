
# ServiceDetailItem


## Properties

Name | Type
------------ | -------------
`id` | string
`serviceId` | string
`description` | string
`detailType` | string
`durationMinutes` | number
`recordDateTime` | Date

## Example

```typescript
import type { ServiceDetailItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "serviceId": null,
  "description": null,
  "detailType": null,
  "durationMinutes": null,
  "recordDateTime": null,
} satisfies ServiceDetailItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ServiceDetailItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


