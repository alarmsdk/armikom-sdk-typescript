
# IntegrationEventDto

One event, identical on the poll endpoint and in an SSE `data:` line.

## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`version` | number
`occurredAt` | Date
`recordedAt` | Date
`monitoringCenter` | [IntegrationMonitoringCenterDto](IntegrationMonitoringCenterDto.md)
`subscriber` | [IntegrationSubscriberDto](IntegrationSubscriberDto.md)
`partition` | number
`zone` | string
`signal` | [IntegrationSignalDto](IntegrationSignalDto.md)
`signalType` | [IntegrationSignalTypeDto](IntegrationSignalTypeDto.md)
`isTest` | boolean
`alarm` | [IntegrationAlarmDto](IntegrationAlarmDto.md)

## Example

```typescript
import type { IntegrationEventDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "version": null,
  "occurredAt": null,
  "recordedAt": null,
  "monitoringCenter": null,
  "subscriber": null,
  "partition": null,
  "zone": null,
  "signal": null,
  "signalType": null,
  "isTest": null,
  "alarm": null,
} satisfies IntegrationEventDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as IntegrationEventDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


