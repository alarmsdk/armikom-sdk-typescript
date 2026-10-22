
# HolidayListItem

A row of `ListHolidays`. A superset of `LookupItem` — `id`, `name`, `parentId` and `monitoringCenterId` keep their meaning for existing clients — plus the calendar date, without which a holiday list cannot be reviewed (G-79). `date` is a calendar date stored as midnight with no zone conversion (D21); the Engine matches it on month and day every year.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`parentId` | string
`monitoringCenterId` | string
`date` | Date
`holidayTypeId` | string

## Example

```typescript
import type { HolidayListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "parentId": null,
  "monitoringCenterId": null,
  "date": null,
  "holidayTypeId": null,
} satisfies HolidayListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as HolidayListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


