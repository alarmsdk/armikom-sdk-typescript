
# MyAlarmSisComparisonResponse

Result of a MyAlarmSis ↔ Armikom signal comparison. Only results are compared: what MyAlarmSis made of a signal (`mesajlar`) against the `SignalEvent` Armikom made of the same signal forwarded by the Agent poller.

## Properties

Name | Type
------------ | -------------
`fromUtc` | Date
`toUtc` | Date
`toleranceSeconds` | number
`summary` | [MyAlarmSisComparisonSummary](MyAlarmSisComparisonSummary.md)
`fieldDifferences` | [Array&lt;MyAlarmSisFieldDifferenceCount&gt;](MyAlarmSisFieldDifferenceCount.md)
`bySignalType` | [Array&lt;MyAlarmSisSignalTypeBreakdown&gt;](MyAlarmSisSignalTypeBreakdown.md)
`missingReasons` | [Array&lt;MyAlarmSisReasonCount&gt;](MyAlarmSisReasonCount.md)
`rows` | [Array&lt;MyAlarmSisComparisonRow&gt;](MyAlarmSisComparisonRow.md)
`capped` | boolean
`rowLimit` | number
`monitoringCenters` | [Array&lt;MyAlarmSisCenterMapping&gt;](MyAlarmSisCenterMapping.md)

## Example

```typescript
import type { MyAlarmSisComparisonResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "fromUtc": null,
  "toUtc": null,
  "toleranceSeconds": null,
  "summary": null,
  "fieldDifferences": null,
  "bySignalType": null,
  "missingReasons": null,
  "rows": null,
  "capped": null,
  "rowLimit": null,
  "monitoringCenters": null,
} satisfies MyAlarmSisComparisonResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisComparisonResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


