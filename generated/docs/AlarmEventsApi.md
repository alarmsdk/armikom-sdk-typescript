# AlarmEventsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**batchCompleteAlarmEvents**](AlarmEventsApi.md#batchcompletealarmevents) | **POST** /v1/alarm-events/batch-complete | Complete all alarm events matching the selected signal codes |
| [**batchDelayAlarmEvents**](AlarmEventsApi.md#batchdelayalarmevents) | **POST** /v1/alarm-events/batch-delay | Delay all alarm events matching the selected signal codes |
| [**completeAlarmEvent**](AlarmEventsApi.md#completealarmevent) | **POST** /v1/alarm-events/{id}/complete | Complete an alarm event — stamp action, delete alarm rows, release lock |
| [**getAlarmEventById**](AlarmEventsApi.md#getalarmeventbyid) | **GET** /v1/alarm-events/{id} | Get alarm event detail by ID |
| [**getAlarmEvents**](AlarmEventsApi.md#getalarmevents) | **GET** /v1/alarm-events | Get the active alarm event list |
| [**getBatchCandidates**](AlarmEventsApi.md#getbatchcandidates) | **GET** /v1/alarm-events/batch-candidates | List alarm event signal codes grouped for batch operations |
| [**handleByAi**](AlarmEventsApi.md#handlebyaioperation) | **POST** /v1/alarm-events/{id}/handle-by-ai | Hand off an alarm event to the AI agent |
| [**lockAlarmEvent**](AlarmEventsApi.md#lockalarmevent) | **POST** /v1/alarm-events/{id}/lock | Take or force-take the operator lock on an alarm event\&#39;s subscriber |
| [**quickCompleteAlarmEvent**](AlarmEventsApi.md#quickcompletealarmevent) | **POST** /v1/alarm-events/{id}/quick-complete | Quick-complete an alarm event using a canned signal explanation |
| [**unlockAlarmEvent**](AlarmEventsApi.md#unlockalarmevent) | **DELETE** /v1/alarm-events/{id}/lock | Release the operator lock on an alarm event\&#39;s subscriber |



## batchCompleteAlarmEvents

> BatchCompleteResponse batchCompleteAlarmEvents(batchCompleteRequest, xCorrelationId, idempotencyKey)

Complete all alarm events matching the selected signal codes

Stamps every affected SignalEvent.Action with the operator\&#39;s action text (D19 format), then deletes the matching AlarmEvent rows. Returns the number of deleted rows. Empty signalCodes returns 422. Empty action returns 422. If expectedCount is provided and does not match the current count, returns 409. A single alarm-list-updated event is published, not one per row.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { BatchCompleteAlarmEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // BatchCompleteRequest
    batchCompleteRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies BatchCompleteAlarmEventsRequest;

  try {
    const data = await api.batchCompleteAlarmEvents(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **batchCompleteRequest** | [BatchCompleteRequest](BatchCompleteRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**BatchCompleteResponse**](BatchCompleteResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **409** | Conflict |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## batchDelayAlarmEvents

> BatchDelayResponse batchDelayAlarmEvents(batchDelayRequest, xCorrelationId, idempotencyKey)

Delay all alarm events matching the selected signal codes

Moves each matching AlarmEvent to a WaitingEvent with the specified delay time, copying all 12 denormalized fields. The AlarmEvent rows are then deleted. Empty signalCodes returns 422. delayMinutes &lt;&#x3D; 0 returns 422. If expectedCount is provided and does not match the current count, returns 409.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { BatchDelayAlarmEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // BatchDelayRequest
    batchDelayRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies BatchDelayAlarmEventsRequest;

  try {
    const data = await api.batchDelayAlarmEvents(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **batchDelayRequest** | [BatchDelayRequest](BatchDelayRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**BatchDelayResponse**](BatchDelayResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **409** | Conflict |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## completeAlarmEvent

> CompleteAlarmResponse completeAlarmEvent(id, completeAlarmRequest, xCorrelationId, idempotencyKey)

Complete an alarm event — stamp action, delete alarm rows, release lock

Stamps the operator\&#39;s action text onto the SignalEvent, deletes the side\&#39;s AlarmEvent rows, syncs the denormalised ActionText column, releases the lock, and publishes alarm-list-updated. The action text must differ from originalAction (the value the client loaded). Empty or whitespace-only action returns 422. &#x60;id&#x60; is an AlarmEvent id; a SignalEvent id is also accepted for the XAF client (F2.16c).

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { CompleteAlarmEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // CompleteAlarmRequest
    completeAlarmRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CompleteAlarmEventRequest;

  try {
    const data = await api.completeAlarmEvent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **completeAlarmRequest** | [CompleteAlarmRequest](CompleteAlarmRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**CompleteAlarmResponse**](CompleteAlarmResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAlarmEventById

> AlarmEventDetailResponse getAlarmEventById(id, xCorrelationId)

Get alarm event detail by ID

Returns full alarm event detail including the linked signal event with subscriber info, contacts, notes, zones, timetables, and signal history.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { GetAlarmEventByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetAlarmEventByIdRequest;

  try {
    const data = await api.getAlarmEventById(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**AlarmEventDetailResponse**](AlarmEventDetailResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getAlarmEvents

> Array&lt;AlarmEventListItem&gt; getAlarmEvents(sideNo, sideName, signalName, dealerName, locked, sortBy, sortDesc, limit, xCorrelationId)

Get the active alarm event list

Returns the current alarm events sorted by lock status (unlocked first), signal type priority (ascending), then event date (newest first). Supports optional filters and custom sort. The total count of matching rows is reported via X-Total-Count response header. Default limit is 100, maximum is 500.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { GetAlarmEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // number (optional)
    sideNo: 56,
    // string (optional)
    sideName: sideName_example,
    // string (optional)
    signalName: signalName_example,
    // string (optional)
    dealerName: dealerName_example,
    // boolean (optional)
    locked: true,
    // AlarmEventSortBy (optional)
    sortBy: ...,
    // boolean (optional)
    sortDesc: true,
    // number | Maximum number of alarm events to return. Clamped to 500. (optional)
    limit: 56,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetAlarmEventsRequest;

  try {
    const data = await api.getAlarmEvents(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **sideNo** | `number` |  | [Optional] [Defaults to `undefined`] |
| **sideName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **signalName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **dealerName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **locked** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **sortBy** | `AlarmEventSortBy` |  | [Optional] [Defaults to `undefined`] [Enum: sideNo, sideName, signalName, eventDate, priority, dealerName] |
| **sortDesc** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` | Maximum number of alarm events to return. Clamped to 500. | [Optional] [Defaults to `100`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;AlarmEventListItem&gt;**](AlarmEventListItem.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * X-Total-Count - Total number of alarm events matching the filter (before limit/paging). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getBatchCandidates

> Array&lt;BatchCandidateItem&gt; getBatchCandidates(xCorrelationId)

List alarm event signal codes grouped for batch operations

Groups active alarm events by SignalType.SignalCode and returns each code with its display name and event count, ordered by count descending. Rows with null EventId or null/empty SignalCode are excluded. Tenant-filtered — an operator sees only their monitoring center\&#39;s alarms.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { GetBatchCandidatesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetBatchCandidatesRequest;

  try {
    const data = await api.getBatchCandidates(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;BatchCandidateItem&gt;**](BatchCandidateItem.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## handleByAi

> HandleByAiResponse handleByAi(id, xCorrelationId, idempotencyKey, handleByAiRequest)

Hand off an alarm event to the AI agent

Publishes a handleByAi command on the bus with the resolved SignalEventId and an optional prompt. Acceptance (202) means the command was published — it does NOT mean the AI has processed it. The consumer is currently a dry-run logger; no result or status channel exists yet.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { HandleByAiOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // HandleByAiRequest (optional)
    handleByAiRequest: ...,
  } satisfies HandleByAiOperationRequest;

  try {
    const data = await api.handleByAi(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |
| **handleByAiRequest** | [HandleByAiRequest](HandleByAiRequest.md) |  | [Optional] |

### Return type

[**HandleByAiResponse**](HandleByAiResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Accepted |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **503** | Service Unavailable |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## lockAlarmEvent

> LockAlarmResponse lockAlarmEvent(id, force, xCorrelationId, idempotencyKey)

Take or force-take the operator lock on an alarm event\&#39;s subscriber

Locks the Side associated with the alarm event for the calling operator. If another user holds the lock, returns 409 with the holder\&#39;s identity. Use ?force&#x3D;true to displace the current holder (reported in sideEffects). Idempotent: locking an already-held-by-caller alarm returns 200 without extra writes.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { LockAlarmEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // boolean (optional)
    force: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies LockAlarmEventRequest;

  try {
    const data = await api.lockAlarmEvent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **force** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**LockAlarmResponse**](LockAlarmResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **409** | Conflict |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## quickCompleteAlarmEvent

> QuickCompleteAlarmResponse quickCompleteAlarmEvent(id, quickCompleteAlarmRequest, xCorrelationId, idempotencyKey)

Quick-complete an alarm event using a canned signal explanation

Picks the explanation\&#39;s Name as the action text (\&quot;N/A\&quot; when null), stamps it onto the SignalEvent, deletes the side\&#39;s AlarmEvent rows, and publishes alarm-list-updated. Completing an already-deleted alarm event returns 404.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { QuickCompleteAlarmEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // QuickCompleteAlarmRequest
    quickCompleteAlarmRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies QuickCompleteAlarmEventRequest;

  try {
    const data = await api.quickCompleteAlarmEvent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **quickCompleteAlarmRequest** | [QuickCompleteAlarmRequest](QuickCompleteAlarmRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**QuickCompleteAlarmResponse**](QuickCompleteAlarmResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## unlockAlarmEvent

> unlockAlarmEvent(id, xCorrelationId)

Release the operator lock on an alarm event\&#39;s subscriber

Releases the lock on the Side associated with the alarm event. Only the current holder can release; otherwise returns 409.

### Example

```ts
import {
  Configuration,
  AlarmEventsApi,
} from '';
import type { UnlockAlarmEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AlarmEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies UnlockAlarmEventRequest;

  try {
    const data = await api.unlockAlarmEvent(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **id** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **409** | Conflict |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

