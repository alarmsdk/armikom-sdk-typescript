
# SideBatchUpdateChanges

The assignable fields. Each is tri-state: absent leaves the column alone, a value sets it, an explicit `null` clears it.

## Properties

Name | Type
------------ | -------------
`brandId` | string
`modelId` | string
`protocolId` | string
`cityId` | string
`districtId` | string
`regionId` | string
`dealerId` | string
`installerId` | string
`customerId` | string
`accountTypeId` | string
`sideTypeId` | string
`comment` | string

## Example

```typescript
import type { SideBatchUpdateChanges } from ''

// TODO: Update the object below with actual values
const example = {
  "brandId": null,
  "modelId": null,
  "protocolId": null,
  "cityId": null,
  "districtId": null,
  "regionId": null,
  "dealerId": null,
  "installerId": null,
  "customerId": null,
  "accountTypeId": null,
  "sideTypeId": null,
  "comment": null,
} satisfies SideBatchUpdateChanges

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideBatchUpdateChanges
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


