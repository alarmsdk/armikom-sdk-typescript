
# ReportParameterDto


## Properties

Name | Type
------------ | -------------
`name` | string
`label` | string
`type` | string
`required` | boolean
`multi` | boolean
`_default` | string
`options` | [Array&lt;ReportParameterOptionDto&gt;](ReportParameterOptionDto.md)
`source` | string
`description` | string

## Example

```typescript
import type { ReportParameterDto } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "label": null,
  "type": null,
  "required": null,
  "multi": null,
  "_default": null,
  "options": null,
  "source": null,
  "description": null,
} satisfies ReportParameterDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportParameterDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


