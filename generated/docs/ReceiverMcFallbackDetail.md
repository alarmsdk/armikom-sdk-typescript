
# ReceiverMcFallbackDetail

Where the Engine looks for a signal\'s subscriber when it is not under the receiver\'s own monitoring centre: first Armikom.Api.Contracts.Admin.ReceiverMcFallbackDetail.MonitoringCenters in order, then every other centre when the effective cross-centre lookup is on.

## Properties

Name | Type
------------ | -------------
`receiverId` | string
`crossMcSideLookup` | boolean
`monitoringCenters` | [Array&lt;ReceiverFallbackMonitoringCenterItem&gt;](ReceiverFallbackMonitoringCenterItem.md)

## Example

```typescript
import type { ReceiverMcFallbackDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "receiverId": null,
  "crossMcSideLookup": null,
  "monitoringCenters": null,
} satisfies ReceiverMcFallbackDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReceiverMcFallbackDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


