
# ReferenceBundleResponse


## Properties

Name | Type
------------ | -------------
`brands` | [Array&lt;LookupItem&gt;](LookupItem.md)
`countries` | [Array&lt;LookupItem&gt;](LookupItem.md)
`regions` | [Array&lt;LookupItem&gt;](LookupItem.md)
`cities` | [Array&lt;LookupItem&gt;](LookupItem.md)
`accountTypes` | [Array&lt;LookupItem&gt;](LookupItem.md)
`sideTypes` | [Array&lt;LookupItem&gt;](LookupItem.md)
`serviceTypes` | [Array&lt;LookupItem&gt;](LookupItem.md)
`accountItems` | [Array&lt;LookupItem&gt;](LookupItem.md)
`signalTypes` | [Array&lt;SignalTypeItem&gt;](SignalTypeItem.md)
`alarmCategories` | [Array&lt;LookupItem&gt;](LookupItem.md)
`monitoringCenters` | [Array&lt;MonitoringCenterItem&gt;](MonitoringCenterItem.md)
`activeCategories` | [Array&lt;ActiveCategoryItem&gt;](ActiveCategoryItem.md)
`receivers` | [Array&lt;ReceiverItem&gt;](ReceiverItem.md)

## Example

```typescript
import type { ReferenceBundleResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "brands": null,
  "countries": null,
  "regions": null,
  "cities": null,
  "accountTypes": null,
  "sideTypes": null,
  "serviceTypes": null,
  "accountItems": null,
  "signalTypes": null,
  "alarmCategories": null,
  "monitoringCenters": null,
  "activeCategories": null,
  "receivers": null,
} satisfies ReferenceBundleResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReferenceBundleResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


