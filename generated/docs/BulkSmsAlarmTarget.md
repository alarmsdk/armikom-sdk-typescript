
# BulkSmsAlarmTarget

Open alarms to take the subscribers from: the signal types ticked on the batch screen, its panel (brand/model) filter and, optionally, one dealer.

## Properties

Name | Type
------------ | -------------
`signalCodes` | Array&lt;string&gt;
`brandId` | string
`modelId` | string
`dealerId` | string
`cutoffUtc` | Date

## Example

```typescript
import type { BulkSmsAlarmTarget } from ''

// TODO: Update the object below with actual values
const example = {
  "signalCodes": null,
  "brandId": null,
  "modelId": null,
  "dealerId": null,
  "cutoffUtc": null,
} satisfies BulkSmsAlarmTarget

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BulkSmsAlarmTarget
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


