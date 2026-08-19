
# CreateSimCardRequest


## Properties

Name | Type
------------ | -------------
`mobileOperatorId` | string
`number` | string
`imsi` | string
`iccid` | string
`dateGiven` | Date
`dateStart` | Date
`dateEnd` | Date
`active` | boolean
`note` | string

## Example

```typescript
import type { CreateSimCardRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "mobileOperatorId": null,
  "number": null,
  "imsi": null,
  "iccid": null,
  "dateGiven": null,
  "dateStart": null,
  "dateEnd": null,
  "active": null,
  "note": null,
} satisfies CreateSimCardRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateSimCardRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


