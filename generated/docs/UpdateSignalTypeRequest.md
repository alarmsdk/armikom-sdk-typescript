
# UpdateSignalTypeRequest

PATCH body — a property left null is not written.

## Properties

Name | Type
------------ | -------------
`name` | string
`alert` | boolean
`soundAlert` | boolean
`priority` | number
`backColor` | string
`frontColor` | string
`signalCode` | string
`notificationText` | string
`notes` | string

## Example

```typescript
import type { UpdateSignalTypeRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "alert": null,
  "soundAlert": null,
  "priority": null,
  "backColor": null,
  "frontColor": null,
  "signalCode": null,
  "notificationText": null,
  "notes": null,
} satisfies UpdateSignalTypeRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as UpdateSignalTypeRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


