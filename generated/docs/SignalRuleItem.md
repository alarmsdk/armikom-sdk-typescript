
# SignalRuleItem

One monitoring-center signal rule as the console lists it: <i>when</i> the facts about a signal match, <i>then</i> change how the pipeline handles it (keep it off the alarm list, force it on, override its priority, suppress a notification channel, add a note).

## Properties

Name | Type
------------ | -------------
`id` | string
`global` | boolean
`code` | string
`name` | string
`description` | string
`priority` | number
`mode` | string
`stopProcessing` | boolean
`allowCritical` | boolean
`validFrom` | Date
`validTo` | Date
`managedAsCode` | boolean
`sourcePath` | string
`updatedAt` | Date
`updatedBy` | string

## Example

```typescript
import type { SignalRuleItem } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "global": null,
  "code": null,
  "name": null,
  "description": null,
  "priority": null,
  "mode": null,
  "stopProcessing": null,
  "allowCritical": null,
  "validFrom": null,
  "validTo": null,
  "managedAsCode": null,
  "sourcePath": null,
  "updatedAt": null,
  "updatedBy": null,
} satisfies SignalRuleItem

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SignalRuleItem
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


