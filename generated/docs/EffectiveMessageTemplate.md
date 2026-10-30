
# EffectiveMessageTemplate

The text that currently applies to a (channel, kind), for clients that prefill it.

## Properties

Name | Type
------------ | -------------
`channel` | string
`kind` | string
`subject` | string
`body` | string
`isCustom` | boolean

## Example

```typescript
import type { EffectiveMessageTemplate } from ''

// TODO: Update the object below with actual values
const example = {
  "channel": null,
  "kind": null,
  "subject": null,
  "body": null,
  "isCustom": null,
} satisfies EffectiveMessageTemplate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as EffectiveMessageTemplate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


