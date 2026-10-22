
# EffectiveSideHolidayItem

One day the Engine treats as a holiday for a subscriber: either the subscriber\'s own `SideHoliday` row or a reference `Holiday` inherited through `Side → SideType → HolidayType` (G-80).

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`date` | Date
`recurring` | boolean
`source` | string
`holidayTypeId` | string
`holidayTypeName` | string

## Example

```typescript
import type { EffectiveSideHolidayItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "date": null,
  "recurring": null,
  "source": null,
  "holidayTypeId": null,
  "holidayTypeName": null,
} satisfies EffectiveSideHolidayItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EffectiveSideHolidayItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


