
# ActivityEventItem


## Properties

Name | Type
------------ | -------------
`type` | string
`occurredAt` | Date
`target` | string
`caption` | string
`detail` | { [key: string]: string | undefined; }

## Example

```typescript
import type { ActivityEventItem } from ''

// TODO: Update the object below with actual values
const example = {
  "type": null,
  "occurredAt": null,
  "target": null,
  "caption": null,
  "detail": null,
} satisfies ActivityEventItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActivityEventItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


