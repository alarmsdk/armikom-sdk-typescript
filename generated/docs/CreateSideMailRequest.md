
# CreateSideMailRequest


## Properties

Name | Type
------------ | -------------
`mailTo` | string
`mailText` | string
`alarmCategoryId` | string

## Example

```typescript
import type { CreateSideMailRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "mailTo": null,
  "mailText": null,
  "alarmCategoryId": null,
} satisfies CreateSideMailRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSideMailRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


