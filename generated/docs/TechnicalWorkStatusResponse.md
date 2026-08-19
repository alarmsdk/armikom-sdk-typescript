
# TechnicalWorkStatusResponse


## Properties

Name | Type
------------ | -------------
`active` | boolean
`endsAt` | Date
`technicianName` | string
`zone` | string

## Example

```typescript
import type { TechnicalWorkStatusResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "active": null,
  "endsAt": null,
  "technicianName": null,
  "zone": null,
} satisfies TechnicalWorkStatusResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TechnicalWorkStatusResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


