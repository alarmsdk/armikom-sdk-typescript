
# CreateSignalRelationRequest

Create body. The three membership lists are replace-all sets of ids.

## Properties

Name | Type
------------ | -------------
`name` | string
`typeId` | string
`global` | boolean
`parameters` | string
`priority` | number
`sourceSignalTypeIds` | Array&lt;string&gt;
`targetSignalTypeIds` | Array&lt;string&gt;
`sideIds` | Array&lt;string&gt;

## Example

```typescript
import type { CreateSignalRelationRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "typeId": null,
  "global": null,
  "parameters": null,
  "priority": null,
  "sourceSignalTypeIds": null,
  "targetSignalTypeIds": null,
  "sideIds": null,
} satisfies CreateSignalRelationRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSignalRelationRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


