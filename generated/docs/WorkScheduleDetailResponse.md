
# WorkScheduleDetailResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`isActive` | boolean
`entries` | [Array&lt;WorkScheduleEntryDto&gt;](WorkScheduleEntryDto.md)

## Example

```typescript
import type { WorkScheduleDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "isActive": null,
  "entries": null,
} satisfies WorkScheduleDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as WorkScheduleDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


