
# TimeTableWriteItem


## Properties

Name | Type
------------ | -------------
`day` | number
`openingTime` | string
`closingTime` | string
`openingEarlyMinutes` | number
`openingLateMinutes` | number
`closingEarlyMinutes` | number
`closingLateMinutes` | number

## Example

```typescript
import type { TimeTableWriteItem } from ''

// TODO: Update the object below with actual values
const example = {
  "day": null,
  "openingTime": null,
  "closingTime": null,
  "openingEarlyMinutes": null,
  "openingLateMinutes": null,
  "closingEarlyMinutes": null,
  "closingLateMinutes": null,
} satisfies TimeTableWriteItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TimeTableWriteItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


