
# CreateSideControlRequest


## Properties

Name | Type
------------ | -------------
`signalId` | string
`controlSignalId` | string
`active` | boolean
`timeoutDuration` | number

## Example

```typescript
import type { CreateSideControlRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "signalId": null,
  "controlSignalId": null,
  "active": null,
  "timeoutDuration": null,
} satisfies CreateSideControlRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSideControlRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


