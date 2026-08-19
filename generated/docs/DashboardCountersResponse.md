
# DashboardCountersResponse


## Properties

Name | Type
------------ | -------------
`activeAlarms` | number
`liveEventsToday` | number
`activeSignals` | number

## Example

```typescript
import type { DashboardCountersResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "activeAlarms": null,
  "liveEventsToday": null,
  "activeSignals": null,
} satisfies DashboardCountersResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DashboardCountersResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


