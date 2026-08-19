
# TechnicalPersonItem


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`phone1` | string
`specialization` | string
`dealerId` | string

## Example

```typescript
import type { TechnicalPersonItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "phone1": null,
  "specialization": null,
  "dealerId": null,
} satisfies TechnicalPersonItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TechnicalPersonItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


