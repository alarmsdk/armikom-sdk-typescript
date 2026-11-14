
# ServiceTypeItem

A field service type. DefaultStatement is the description the operator UI copies into a new service\'s statement when this type is picked (the operator can still edit it).

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`defaultStatement` | string

## Example

```typescript
import type { ServiceTypeItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "defaultStatement": null,
} satisfies ServiceTypeItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ServiceTypeItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


