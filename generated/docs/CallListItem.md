
# CallListItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideId` | string
`sideName` | string
`sideNo` | string
`extension` | string
`callDateTime` | Date
`phone` | string
`ringSeconds` | number
`talkSeconds` | number
`answered` | boolean
`stateRaw` | string
`direction` | string
`hasRecording` | boolean
`uniqueId` | string

## Example

```typescript
import type { CallListItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideId": null,
  "sideName": null,
  "sideNo": null,
  "extension": null,
  "callDateTime": null,
  "phone": null,
  "ringSeconds": null,
  "talkSeconds": null,
  "answered": null,
  "stateRaw": null,
  "direction": null,
  "hasRecording": null,
  "uniqueId": null,
} satisfies CallListItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CallListItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


