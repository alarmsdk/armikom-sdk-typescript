
# SignalTypeDetail


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`alert` | boolean
`soundAlert` | boolean
`priority` | number
`backColor` | string
`frontColor` | string
`signalCode` | string
`notificationText` | string
`notes` | string
`signalCount` | number

## Example

```typescript
import type { SignalTypeDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "alert": null,
  "soundAlert": null,
  "priority": null,
  "backColor": null,
  "frontColor": null,
  "signalCode": null,
  "notificationText": null,
  "notes": null,
  "signalCount": null,
} satisfies SignalTypeDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalTypeDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


