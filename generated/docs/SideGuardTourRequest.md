
# SideGuardTourRequest

Create and full-replace payload for a guard tour.

## Properties

Name | Type
------------ | -------------
`name` | string
`sideZoneId` | string
`startTime` | string
`endTime` | string
`intervalMinutes` | number
`active` | boolean
`notes` | string
`signalTypeIds` | Array&lt;string&gt;

## Example

```typescript
import type { SideGuardTourRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "sideZoneId": null,
  "startTime": null,
  "endTime": null,
  "intervalMinutes": null,
  "active": null,
  "notes": null,
  "signalTypeIds": null,
} satisfies SideGuardTourRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideGuardTourRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


