
# SimCardItem


## Properties

Name | Type
------------ | -------------
`id` | string
`mobileOperatorId` | string
`mobileOperatorName` | string
`number` | string
`imsi` | string
`iccid` | string
`dateGiven` | Date
`dateStart` | Date
`dateEnd` | Date
`dateLastSynced` | Date
`dateLastActive` | Date
`active` | boolean
`note` | string

## Example

```typescript
import type { SimCardItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "mobileOperatorId": null,
  "mobileOperatorName": null,
  "number": null,
  "imsi": null,
  "iccid": null,
  "dateGiven": null,
  "dateStart": null,
  "dateEnd": null,
  "dateLastSynced": null,
  "dateLastActive": null,
  "active": null,
  "note": null,
} satisfies SimCardItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SimCardItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


