
# SideStatusReportRequest

The active/passive history report (AR-29): every activation and deactivation in the range, with the operator who made it and the reason given.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`dealerId` | string
`format` | string
`timeZone` | string

## Example

```typescript
import type { SideStatusReportRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "dealerId": null,
  "format": null,
  "timeZone": null,
} satisfies SideStatusReportRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideStatusReportRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


