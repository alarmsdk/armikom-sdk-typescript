
# CallDetailResponse


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
`channel` | string
`dstChannel` | string
`recordingFile` | string
`dcontext` | string

## Example

```typescript
import type { CallDetailResponse } from ''

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
  "channel": null,
  "dstChannel": null,
  "recordingFile": null,
  "dcontext": null,
} satisfies CallDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CallDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


