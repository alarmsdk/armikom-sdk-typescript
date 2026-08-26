
# CopilotSegmentDto


## Properties

Name | Type
------------ | -------------
`speaker` | string
`text` | string
`startOffsetMs` | number
`endOffsetMs` | number
`isFinal` | boolean
`sequenceKey` | number

## Example

```typescript
import type { CopilotSegmentDto } from ''

// TODO: Update the object below with actual values
const example = {
  "speaker": null,
  "text": null,
  "startOffsetMs": null,
  "endOffsetMs": null,
  "isFinal": null,
  "sequenceKey": null,
} satisfies CopilotSegmentDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotSegmentDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


