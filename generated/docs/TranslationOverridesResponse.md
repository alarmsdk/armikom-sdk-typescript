
# TranslationOverridesResponse

The tenant\'s console text overrides, per culture (D82). Public: the console applies them before anyone has logged in, so the login screen reads the same words as the rest.

## Properties

Name | Type
------------ | -------------
`cultures` | { [key: string]: { [key: string]: string | undefined; } | undefined; }

## Example

```typescript
import type { TranslationOverridesResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "cultures": null,
} satisfies TranslationOverridesResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TranslationOverridesResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


