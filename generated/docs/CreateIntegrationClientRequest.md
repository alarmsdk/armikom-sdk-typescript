
# CreateIntegrationClientRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`monitoringCenterId` | string
`dealerId` | string
`eventTypes` | Array&lt;string&gt;
`maxConcurrentStreams` | number

## Example

```typescript
import type { CreateIntegrationClientRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "monitoringCenterId": null,
  "dealerId": null,
  "eventTypes": null,
  "maxConcurrentStreams": null,
} satisfies CreateIntegrationClientRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateIntegrationClientRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


