
# SideDataIssueItem


## Properties

Name | Type
------------ | -------------
`id` | string
`sideNo` | number
`partNo` | number
`name` | string
`active` | boolean
`dealerName` | string
`customerName` | string
`brandId` | string
`brandName` | string
`modelId` | string
`modelName` | string
`protocolId` | string
`protocolName` | string
`issueType` | string

## Example

```typescript
import type { SideDataIssueItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "sideNo": null,
  "partNo": null,
  "name": null,
  "active": null,
  "dealerName": null,
  "customerName": null,
  "brandId": null,
  "brandName": null,
  "modelId": null,
  "modelName": null,
  "protocolId": null,
  "protocolName": null,
  "issueType": null,
} satisfies SideDataIssueItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideDataIssueItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


