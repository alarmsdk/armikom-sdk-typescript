
# ClosingScheduleEntry

One day\'s closing time in the subscriber\'s weekly schedule.

## Properties

Name | Type
------------ | -------------
`day` | number
`closingTime` | string
`isNextDay` | boolean

## Example

```typescript
import type { ClosingScheduleEntry } from ''

// TODO: Update the object below with actual values
const example = {
  "day": null,
  "closingTime": null,
  "isNextDay": null,
} satisfies ClosingScheduleEntry

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClosingScheduleEntry
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


