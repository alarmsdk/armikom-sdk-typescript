
# EffectiveSignalTypeItem


## Properties

Name | Type
------------ | -------------
`signalTypeId` | string
`signalTypeName` | string
`signalCode` | string
`alert` | boolean
`soundAlert` | boolean
`priority` | number
`backColor` | string
`frontColor` | string
`notes` | string
`notificationText` | string
`overriddenFields` | Array&lt;string&gt;

## Example

```typescript
import type { EffectiveSignalTypeItem } from ''

// TODO: Update the object below with actual values
const example = {
  "signalTypeId": null,
  "signalTypeName": null,
  "signalCode": null,
  "alert": null,
  "soundAlert": null,
  "priority": null,
  "backColor": null,
  "frontColor": null,
  "notes": null,
  "notificationText": null,
  "overriddenFields": null,
} satisfies EffectiveSignalTypeItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EffectiveSignalTypeItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


