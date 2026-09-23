
# BulkSendSmsRequest

Send the same SMS text to many subscribers at once. The target is named one of two ways (exactly like SideBatchUpdateRequest): SideIds for a ticked list, or Filter for \"everything this search matched\". Recipients per subscriber are resolved server-side: \"first-contact\" uses Phone1 of the first SideContact (by RowNo), \"sms-contacts\" uses all contacts defined in the subscriber\'s SideSms notification rules.

## Properties

Name | Type
------------ | -------------
`text` | string
`recipients` | string
`sideIds` | Array&lt;string&gt;
`filter` | [BulkSmsFilterRequest](BulkSmsFilterRequest.md)
`expectedCount` | number

## Example

```typescript
import type { BulkSendSmsRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "recipients": null,
  "sideIds": null,
  "filter": null,
  "expectedCount": null,
} satisfies BulkSendSmsRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as BulkSendSmsRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


