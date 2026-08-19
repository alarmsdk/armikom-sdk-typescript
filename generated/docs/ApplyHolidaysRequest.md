
# ApplyHolidaysRequest


## Properties

Name | Type
------------ | -------------
`holidays` | [Array&lt;CreateHolidayRequest&gt;](CreateHolidayRequest.md)
`target` | [ApplyHolidayTarget](ApplyHolidayTarget.md)

## Example

```typescript
import type { ApplyHolidaysRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "holidays": null,
  "target": null,
} satisfies ApplyHolidaysRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ApplyHolidaysRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


