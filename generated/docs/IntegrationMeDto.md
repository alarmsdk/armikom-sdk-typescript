
# IntegrationMeDto

Response of `GET /v1/integrations/me`.

## Properties

Name | Type
------------ | -------------
`clientId` | string
`name` | string
`monitoringCenter` | [IntegrationMonitoringCenterDto](IntegrationMonitoringCenterDto.md)
`dealerId` | string
`scopes` | Array&lt;string&gt;
`eventTypes` | Array&lt;string&gt;
`maxConcurrentStreams` | number

## Example

```typescript
import type { IntegrationMeDto } from ''

// TODO: Update the object below with actual values
const example = {
  "clientId": null,
  "name": null,
  "monitoringCenter": null,
  "dealerId": null,
  "scopes": null,
  "eventTypes": null,
  "maxConcurrentStreams": null,
} satisfies IntegrationMeDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IntegrationMeDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


