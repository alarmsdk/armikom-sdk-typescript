
# DealerListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`fullName` | string
`contact1` | string
`contact2` | string
`mail1` | string
`active` | boolean
`cityId` | string
`regionId` | string
`recordDateTime` | Date

## Example

```typescript
import type { DealerListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "fullName": null,
  "contact1": null,
  "contact2": null,
  "mail1": null,
  "active": null,
  "cityId": null,
  "regionId": null,
  "recordDateTime": null,
} satisfies DealerListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DealerListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


