
# DealerStatisticsResponse


## Properties

Name | Type
------------ | -------------
`totalSides` | number
`activeSides` | number
`inactiveSides` | number
`systemOpenSides` | number
`systemClosedSides` | number
`technicalServiceSides` | number
`totalSignalsLastWeek` | number
`noSignalSides` | number
`communicationLostSides` | number
`communicationRestoredSides` | number

## Example

```typescript
import type { DealerStatisticsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "totalSides": null,
  "activeSides": null,
  "inactiveSides": null,
  "systemOpenSides": null,
  "systemClosedSides": null,
  "technicalServiceSides": null,
  "totalSignalsLastWeek": null,
  "noSignalSides": null,
  "communicationLostSides": null,
  "communicationRestoredSides": null,
} satisfies DealerStatisticsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DealerStatisticsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


