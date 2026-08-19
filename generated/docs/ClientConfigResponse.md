
# ClientConfigResponse


## Properties

Name | Type
------------ | -------------
`forceUppercase` | boolean
`defaultLanguage` | string
`supportedCultures` | Array&lt;string&gt;
`idleWarningMinutes` | number
`liveSignalLimit` | number
`monitoringCenter` | [MonitoringCenterConfigItem](MonitoringCenterConfigItem.md)
`featureFlags` | { [key: string]: boolean | undefined; }

## Example

```typescript
import type { ClientConfigResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "forceUppercase": null,
  "defaultLanguage": null,
  "supportedCultures": null,
  "idleWarningMinutes": null,
  "liveSignalLimit": null,
  "monitoringCenter": null,
  "featureFlags": null,
} satisfies ClientConfigResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ClientConfigResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


