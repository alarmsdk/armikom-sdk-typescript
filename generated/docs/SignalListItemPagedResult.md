
# SignalListItemPagedResult


## Properties

Name | Type
------------ | -------------
`items` | [Array&lt;SignalListItem&gt;](SignalListItem.md)
`totalCount` | number
`cursor` | string
`hasMore` | boolean
`hasNextPage` | boolean
`page` | number
`pageSize` | number

## Example

```typescript
import type { SignalListItemPagedResult } from ''

// TODO: Update the object below with actual values
const example = {
  "items": null,
  "totalCount": null,
  "cursor": null,
  "hasMore": null,
  "hasNextPage": null,
  "page": null,
  "pageSize": null,
} satisfies SignalListItemPagedResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalListItemPagedResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


