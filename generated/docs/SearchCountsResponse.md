
# SearchCountsResponse

Per-section match counts for a query — the deferred half of a `includeCount=false` search.

## Properties

Name | Type
------------ | -------------
`query` | string
`sections` | [Array&lt;SearchSectionCount&gt;](SearchSectionCount.md)
`totalCount` | number

## Example

```typescript
import type { SearchCountsResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "query": null,
  "sections": null,
  "totalCount": null,
} satisfies SearchCountsResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SearchCountsResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


