
# CreateWorkScheduleRequest


## Properties

Name | Type
------------ | -------------
`name` | string
`isActive` | boolean
`entries` | [Array&lt;WorkScheduleEntryInput&gt;](WorkScheduleEntryInput.md)

## Example

```typescript
import type { CreateWorkScheduleRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "isActive": null,
  "entries": null,
} satisfies CreateWorkScheduleRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateWorkScheduleRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


