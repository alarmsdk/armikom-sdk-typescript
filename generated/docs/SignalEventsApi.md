# SignalEventsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**appendActionText**](SignalEventsApi.md#appendactiontextoperation) | **PATCH** /v1/signal-events/{id}/action | Append text to a signal event\&#39;s action field |
| [**blockReceiver**](SignalEventsApi.md#blockreceiver) | **POST** /v1/signal-events/{id}/receiver-block | Block a side number on the receiver associated with a signal event |
| [**blockSignal**](SignalEventsApi.md#blocksignal) | **POST** /v1/signal-events/{id}/blocks | Block a specific signal code for the subscriber associated with a signal event |
| [**delaySignal**](SignalEventsApi.md#delaysignal) | **POST** /v1/signal-events/{id}/delay | Delay a signal event by creating a WaitingEvent |
| [**exportSignalEvents**](SignalEventsApi.md#exportsignalevents) | **POST** /v1/signal-events/export | Export signal events to CSV or XLSX |
| [**getLiveSignals**](SignalEventsApi.md#getlivesignals) | **GET** /v1/live-signals | Get the most recent live signals |
| [**getSignalEventById**](SignalEventsApi.md#getsignaleventbyid) | **GET** /v1/signal-events/{id} | Get signal event detail by ID |
| [**getSignalEvents**](SignalEventsApi.md#getsignalevents) | **GET** /v1/signal-events | List signal events with filtering, sorting and pagination |



## appendActionText

> AppendActionTextResponse appendActionText(id, appendActionTextRequest, xCorrelationId)

Append text to a signal event\&#39;s action field

Appends text to SignalEvent.Action without completing the alarm. When stamp is true, the text is wrapped with the operator name and UTC timestamp. The denormalised AlarmEvent.ActionText is kept in sync.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { AppendActionTextOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // AppendActionTextRequest
    appendActionTextRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies AppendActionTextOperationRequest;

  try {
    const data = await api.appendActionText(body);
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
| **appendActionTextRequest** | [AppendActionTextRequest](AppendActionTextRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**AppendActionTextResponse**](AppendActionTextResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## blockReceiver

> ReceiverBlockResponse blockReceiver(id, receiverBlockRequest, xCorrelationId, idempotencyKey)

Block a side number on the receiver associated with a signal event

Creates a ReceiverRule row with Allow &#x3D; Block for the given SideNo on the signal event\&#39;s receiver. This prevents the receiver from accepting traffic for that subscriber number. Used when a neighbouring monitoring centre\&#39;s panel dials into the wrong receiver. The existence check is global (IgnoreQueryFilters) — refuses to block a number that belongs to any monitoring centre. Duplicate rules are handled idempotently. WARNING: blocking a SideNo that later gets allocated silently drops alarms — nothing expires these rules.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { BlockReceiverRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // ReceiverBlockRequest
    receiverBlockRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies BlockReceiverRequest;

  try {
    const data = await api.blockReceiver(body);
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
| **receiverBlockRequest** | [ReceiverBlockRequest](ReceiverBlockRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**ReceiverBlockResponse**](ReceiverBlockResponse.md)

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
| **409** | Conflict |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## blockSignal

> SignalBlockResponse blockSignal(id, signalBlockRequest, xCorrelationId, idempotencyKey)

Block a specific signal code for the subscriber associated with a signal event

Creates a SignalBloke row that suppresses the signal event\&#39;s code for its subscriber until the computed end date. Engine\&#39;s IsSignalBlocked reads this on every incoming packet. Expiry is handled by the SignalBlockedJob Quartz schedule, not by a date predicate. Accepts Minute, Hour, and Day time units (S1: Day was missing from Blazor).

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { BlockSignalRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SignalBlockRequest
    signalBlockRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies BlockSignalRequest;

  try {
    const data = await api.blockSignal(body);
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
| **signalBlockRequest** | [SignalBlockRequest](SignalBlockRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**SignalBlockResponse**](SignalBlockResponse.md)

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


## delaySignal

> SignalDelayResponse delaySignal(id, signalDelayRequest, xCorrelationId, idempotencyKey)

Delay a signal event by creating a WaitingEvent

Postpones an alarm by moving it into the WaitingEvent table. Engine\&#39;s WaitingEventJob resurfaces it as an AlarmEvent once the delay expires. The originating AlarmEvent is NOT deleted — matching the existing Blazor and XAF behaviour. Accepts Minute, Hour, and Day time units.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { DelaySignalRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SignalDelayRequest
    signalDelayRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DelaySignalRequest;

  try {
    const data = await api.delaySignal(body);
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
| **signalDelayRequest** | [SignalDelayRequest](SignalDelayRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**SignalDelayResponse**](SignalDelayResponse.md)

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


## exportSignalEvents

> exportSignalEvents(signalExportRequest, xCorrelationId, idempotencyKey)

Export signal events to CSV or XLSX

Exports signal events matching the given filters to a file. Requires a date range. Returns the file directly as a download. Maximum 50,000 rows; date range limited to 12 months.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { ExportSignalEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // SignalExportRequest
    signalExportRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ExportSignalEventsRequest;

  try {
    const data = await api.exportSignalEvents(body);
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
| **signalExportRequest** | [SignalExportRequest](SignalExportRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getLiveSignals

> Array&lt;LiveSignalItem&gt; getLiveSignals(xCorrelationId)

Get the most recent live signals

Returns the last 50 signal events ordered by signal date descending. Excludes test signals (TST) and events with empty signal description.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { GetLiveSignalsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetLiveSignalsRequest;

  try {
    const data = await api.getLiveSignals(body);
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

[**Array&lt;LiveSignalItem&gt;**](LiveSignalItem.md)

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


## getSignalEventById

> SignalEventDetailResponse getSignalEventById(id, xCorrelationId)

Get signal event detail by ID

Returns full signal event detail including the subscriber info, contacts, notes, zones, timetables, and signal history for the associated subscriber.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { GetSignalEventByIdRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSignalEventByIdRequest;

  try {
    const data = await api.getSignalEventById(body);
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

[**SignalEventDetailResponse**](SignalEventDetailResponse.md)

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


## getSignalEvents

> SignalEventListItemPagedResult getSignalEvents(q, from, to, cursor, limit, page, pageSize, offset, sort, sideNo, sideName, receiverName, monitoringCenterName, action, xCorrelationId)

List signal events with filtering, sorting and pagination

Returns a paginated list of signal events visible to the current user. Filter by date range with &#x60;from&#x60;/&#x60;to&#x60; (ISO-8601 UTC). Default sort is by signal date descending.

### Example

```ts
import {
  Configuration,
  SignalEventsApi,
} from '';
import type { GetSignalEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalEventsApi(config);

  const body = {
    // string (optional)
    q: q_example,
    // Date (optional)
    from: 2013-10-20T19:20:30+01:00,
    // Date (optional)
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // number (optional)
    page: 56,
    // number (optional)
    pageSize: 56,
    // number (optional)
    offset: 56,
    // string (optional)
    sort: sort_example,
    // number (optional)
    sideNo: 56,
    // string (optional)
    sideName: sideName_example,
    // string (optional)
    receiverName: receiverName_example,
    // string (optional)
    monitoringCenterName: monitoringCenterName_example,
    // string (optional)
    action: action_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSignalEventsRequest;

  try {
    const data = await api.getSignalEvents(body);
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
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **from** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **to** | `Date` |  | [Optional] [Defaults to `undefined`] |
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **pageSize** | `number` |  | [Optional] [Defaults to `undefined`] |
| **offset** | `number` |  | [Optional] [Defaults to `undefined`] |
| **sort** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sideNo** | `number` |  | [Optional] [Defaults to `undefined`] |
| **sideName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **receiverName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **monitoringCenterName** | `string` |  | [Optional] [Defaults to `undefined`] |
| **action** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**SignalEventListItemPagedResult**](SignalEventListItemPagedResult.md)

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

