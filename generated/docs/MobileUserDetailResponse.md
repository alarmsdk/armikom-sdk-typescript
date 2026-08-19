
# MobileUserDetailResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`phone` | string
`linkedSides` | [Array&lt;MobileUserLinkedSide&gt;](MobileUserLinkedSide.md)
`devices` | [Array&lt;MobileUserDeviceSummary&gt;](MobileUserDeviceSummary.md)

## Example

```typescript
import type { MobileUserDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "phone": null,
  "linkedSides": null,
  "devices": null,
} satisfies MobileUserDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileUserDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


