
# IntegrationClientKeyDto

Returned once by create and rotate. Armikom.Api.Contracts.Integrations.IntegrationClientKeyDto.ApiKey is never retrievable again.

## Properties

Name | Type
------------ | -------------
`client` | [IntegrationClientDto](IntegrationClientDto.md)
`apiKey` | string

## Example

```typescript
import type { IntegrationClientKeyDto } from ''

// TODO: Update the object below with actual values
const example = {
  "client": null,
  "apiKey": null,
} satisfies IntegrationClientKeyDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IntegrationClientKeyDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


