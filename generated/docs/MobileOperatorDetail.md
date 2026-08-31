
# MobileOperatorDetail

A GSM operator, used to classify SIM cards.

## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`simCardCount` | number

## Example

```typescript
import type { MobileOperatorDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "simCardCount": null,
} satisfies MobileOperatorDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MobileOperatorDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


