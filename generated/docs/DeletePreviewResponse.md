
# DeletePreviewResponse

What deleting a subscriber or a contact will do, shown to the user before they confirm.

## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`blockers` | Array&lt;string&gt;
`restorable` | boolean
`willDelete` | [Array&lt;DeletePreviewCountItem&gt;](DeletePreviewCountItem.md)
`kept` | [Array&lt;DeletePreviewCountItem&gt;](DeletePreviewCountItem.md)

## Example

```typescript
import type { DeletePreviewResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "blockers": null,
  "restorable": null,
  "willDelete": null,
  "kept": null,
} satisfies DeletePreviewResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DeletePreviewResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


