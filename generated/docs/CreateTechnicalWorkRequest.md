
# CreateTechnicalWorkRequest


## Properties

Name | Type
------------ | -------------
`sideZoneId` | string
`technicalPersonId` | string
`technicianName` | string
`duration` | number
`timeUnit` | string

## Example

```typescript
import type { CreateTechnicalWorkRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "sideZoneId": null,
  "technicalPersonId": null,
  "technicianName": null,
  "duration": null,
  "timeUnit": null,
} satisfies CreateTechnicalWorkRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTechnicalWorkRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


