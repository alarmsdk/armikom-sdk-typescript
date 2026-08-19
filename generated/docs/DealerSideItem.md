
# DealerSideItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`name` | string
`customerName` | string
`address` | string
`phone1` | string
`active` | boolean
`lastSignalDate` | Date

## Example

```typescript
import type { DealerSideItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "name": null,
  "customerName": null,
  "address": null,
  "phone1": null,
  "active": null,
  "lastSignalDate": null,
} satisfies DealerSideItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DealerSideItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


