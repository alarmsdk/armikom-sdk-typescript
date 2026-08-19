
# TimeTableItem


## Properties

Name | Type
------------ | -------------
`id` | string
`day` | number
`openingTime` | string
`closingTime` | string
`openingEarly` | number
`openingLate` | number
`closingEarly` | number
`closingLate` | number

## Example

```typescript
import type { TimeTableItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "day": null,
  "openingTime": null,
  "closingTime": null,
  "openingEarly": null,
  "openingLate": null,
  "closingEarly": null,
  "closingLate": null,
} satisfies TimeTableItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TimeTableItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


