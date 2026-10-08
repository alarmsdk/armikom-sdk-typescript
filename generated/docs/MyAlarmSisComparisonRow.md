
# MyAlarmSisComparisonRow

One comparison outcome: a pair, or a row present on only one side.

## Properties

Name | Type
------------ | -------------
`kind` | string
`differences` | Array&lt;string&gt;
`timeDeltaSeconds` | number
`missingReason` | string
`myAlarmSis` | [MyAlarmSisSignalSnapshot](MyAlarmSisSignalSnapshot.md)
`armikom` | [ArmikomSignalSnapshot](ArmikomSignalSnapshot.md)

## Example

```typescript
import type { MyAlarmSisComparisonRow } from ''

// TODO: Update the object below with actual values
const example = {
  "kind": null,
  "differences": null,
  "timeDeltaSeconds": null,
  "missingReason": null,
  "myAlarmSis": null,
  "armikom": null,
} satisfies MyAlarmSisComparisonRow

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyAlarmSisComparisonRow
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


