
# TechnicalWorkResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`technicianName` | string
`sideZoneId` | string
`zoneName` | string
`endDate` | Date
`sideEffects` | Array&lt;string&gt;

## Example

```typescript
import type { TechnicalWorkResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "technicianName": null,
  "sideZoneId": null,
  "zoneName": null,
  "endDate": null,
  "sideEffects": null,
} satisfies TechnicalWorkResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TechnicalWorkResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


