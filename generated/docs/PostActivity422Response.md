
# PostActivity422Response


## Properties

Name | Type
------------ | -------------
`type` | string
`title` | string
`status` | number
`detail` | string
`instance` | string
`code` | string
`correlationId` | string
`params` | object
`errors` | { [key: string]: Array&lt;string&gt; | undefined; }

## Example

```typescript
import type { PostActivity422Response } from ''

// TODO: Update the object below with actual values
const example = {
  "type": https://docs.armikom.net/errors/side/not_found,
  "title": null,
  "status": null,
  "detail": null,
  "instance": null,
  "code": SIDE.NOT_FOUND,
  "correlationId": null,
  "params": null,
  "errors": null,
} satisfies PostActivity422Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PostActivity422Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


