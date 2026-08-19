
# MobileMessageItem


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`message` | string
`recordDate` | Date
`sentAt` | Date
`seenDate` | Date

## Example

```typescript
import type { MobileMessageItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "message": null,
  "recordDate": null,
  "sentAt": null,
  "seenDate": null,
} satisfies MobileMessageItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileMessageItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


