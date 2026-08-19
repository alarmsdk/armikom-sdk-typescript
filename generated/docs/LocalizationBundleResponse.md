
# LocalizationBundleResponse

Full localisation bundle for a given culture.  Clients cache this response keyed by ETag; subsequent requests use If-None-Match.

## Properties

Name | Type
------------ | -------------
`culture` | string
`supportedCultures` | Array&lt;string&gt;
`keys` | { [key: string]: string | undefined; }

## Example

```typescript
import type { LocalizationBundleResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "culture": null,
  "supportedCultures": null,
  "keys": null,
} satisfies LocalizationBundleResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as LocalizationBundleResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


