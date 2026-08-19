
# CreateSideSignalTypeRequest


## Properties

Name | Type
------------ | -------------
`signalTypeId` | string
`alert` | boolean
`priority` | number
`backColor` | string
`frontColor` | string
`notes` | string
`notificationText` | string

## Example

```typescript
import type { CreateSideSignalTypeRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "signalTypeId": null,
  "alert": null,
  "priority": null,
  "backColor": null,
  "frontColor": null,
  "notes": null,
  "notificationText": null,
} satisfies CreateSideSignalTypeRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSideSignalTypeRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


