
# MyAlarmSisComparisonSummary


## Properties

Name | Type
------------ | -------------
`myAlarmSisTotal` | number
`myAlarmSisExcluded` | number
`armikomTotal` | number
`armikomExcluded` | number
`matched` | number
`matchedWithDifferences` | number
`alarmFlagDifferences` | number
`missingInArmikom` | number
`extraInArmikom` | number
`missingAlarms` | number

## Example

```typescript
import type { MyAlarmSisComparisonSummary } from ''

// TODO: Update the object below with actual values
const example = {
  "myAlarmSisTotal": null,
  "myAlarmSisExcluded": null,
  "armikomTotal": null,
  "armikomExcluded": null,
  "matched": null,
  "matchedWithDifferences": null,
  "alarmFlagDifferences": null,
  "missingInArmikom": null,
  "extraInArmikom": null,
  "missingAlarms": null,
} satisfies MyAlarmSisComparisonSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisComparisonSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


