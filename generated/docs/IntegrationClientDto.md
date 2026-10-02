
# IntegrationClientDto


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`monitoringCenterId` | string
`dealerId` | string
`keyPrefix` | string
`eventTypes` | Array&lt;string&gt;
`maxConcurrentStreams` | number
`createdAt` | Date
`createdBy` | string
`lastUsedAt` | Date
`revokedAt` | Date

## Example

```typescript
import type { IntegrationClientDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "monitoringCenterId": null,
  "dealerId": null,
  "keyPrefix": null,
  "eventTypes": null,
  "maxConcurrentStreams": null,
  "createdAt": null,
  "createdBy": null,
  "lastUsedAt": null,
  "revokedAt": null,
} satisfies IntegrationClientDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IntegrationClientDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


