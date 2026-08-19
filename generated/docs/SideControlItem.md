
# SideControlItem


## Properties

Name | Type
------------ | -------------
`id` | string
`signalId` | string
`signalName` | string
`controlSignalId` | string
`controlSignalName` | string
`recordDate` | Date
`active` | boolean
`timeoutDuration` | number

## Example

```typescript
import type { SideControlItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "signalId": null,
  "signalName": null,
  "controlSignalId": null,
  "controlSignalName": null,
  "recordDate": null,
  "active": null,
  "timeoutDuration": null,
} satisfies SideControlItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideControlItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


