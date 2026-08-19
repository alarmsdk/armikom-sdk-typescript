
# ServicePhotoItem


## Properties

Name | Type
------------ | -------------
`id` | string
`serviceId` | string
`fileName` | string
`contentType` | string
`description` | string
`photoType` | string
`recordDateTime` | Date

## Example

```typescript
import type { ServicePhotoItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "serviceId": null,
  "fileName": null,
  "contentType": null,
  "description": null,
  "photoType": null,
  "recordDateTime": null,
} satisfies ServicePhotoItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ServicePhotoItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


