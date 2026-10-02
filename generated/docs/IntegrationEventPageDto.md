
# IntegrationEventPageDto

Response of `GET /v1/integrations/events`.

## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;IntegrationEventDto&gt;](IntegrationEventDto.md)
`nextCursor` | string
`hasMore` | boolean

## Example

```typescript
import type { IntegrationEventPageDto } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "nextCursor": null,
  "hasMore": null,
} satisfies IntegrationEventPageDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IntegrationEventPageDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


