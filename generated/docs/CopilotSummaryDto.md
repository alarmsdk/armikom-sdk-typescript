
# CopilotSummaryDto


## Properties

Name | Type
------------ | -------------
`overview` | string
`highlights` | Array&lt;string&gt;
`outcome` | string
`createdAt` | Date

## Example

```typescript
import type { CopilotSummaryDto } from ''

// TODO: Update the object below with actual values
const example = {
  "overview": null,
  "highlights": null,
  "outcome": null,
  "createdAt": null,
} satisfies CopilotSummaryDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CopilotSummaryDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


