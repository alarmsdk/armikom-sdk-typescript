
# MyAlarmSisComparisonRequest

Request body of `POST /v1/admin/myalarmsis/signal-comparison`.

## Properties

Name | Type
------------ | -------------
`from` | Date
`to` | Date
`excludedSignalTypeCodes` | Array&lt;string&gt;
`toleranceSeconds` | number
`monitoringCenterId` | string
`rowKinds` | Array&lt;string&gt;
`rowLimit` | number

## Example

```typescript
import type { MyAlarmSisComparisonRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "from": null,
  "to": null,
  "excludedSignalTypeCodes": null,
  "toleranceSeconds": null,
  "monitoringCenterId": null,
  "rowKinds": null,
  "rowLimit": null,
} satisfies MyAlarmSisComparisonRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisComparisonRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


