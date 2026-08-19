
# WorkScheduleEntryDto


## Properties

Name | Type
------------ | -------------
`id` | string
`dayOfWeek` | number
`startTime` | number
`endTime` | number

## Example

```typescript
import type { WorkScheduleEntryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "dayOfWeek": null,
  "startTime": null,
  "endTime": null,
} satisfies WorkScheduleEntryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WorkScheduleEntryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


