
# SideListItemPagedResult


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;SideListItem&gt;](SideListItem.md)
`totalCount` | number
`cursor` | string
`hasMore` | boolean
`hasNextPage` | boolean
`page` | number
`pageSize` | number

## Example

```typescript
import type { SideListItemPagedResult } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "totalCount": null,
  "cursor": null,
  "hasMore": null,
  "hasNextPage": null,
  "page": null,
  "pageSize": null,
} satisfies SideListItemPagedResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SideListItemPagedResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


