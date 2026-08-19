# WaitingEventsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**cancelWaitingEvent**](WaitingEventsApi.md#cancelwaitingevent) | **DELETE** /v1/waiting-events/{id} | Cancel a delayed signal — the alarm will NOT resurface |
| [**cancelWaitingEventsBulk**](WaitingEventsApi.md#cancelwaitingeventsbulk) | **POST** /v1/waiting-events/cancel-bulk | Cancel multiple delayed signals in one call |
| [**listWaitingEvents**](WaitingEventsApi.md#listwaitingevents) | **GET** /v1/waiting-events | List delayed signals (waiting events) visible to the caller\&#39;s monitoring centre |



## cancelWaitingEvent

> cancelWaitingEvent(id, xCorrelationId)

Cancel a delayed signal — the alarm will NOT resurface

Deletes the WaitingEvent row. The alarm will not be re-created by Engine\&#39;s WaitingEventJob on its next cycle. This matches XAF behaviour: cancelling a delay means the alarm is dropped, not re-queued.

### Example

```ts
import {
  Configuration,
  WaitingEventsApi,
} from '';
import type { CancelWaitingEventRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new WaitingEventsApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies CancelWaitingEventRequest;

  try {
    const data = await api.cancelWaitingEvent(body);
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
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## cancelWaitingEventsBulk

> BulkCancelResponse cancelWaitingEventsBulk(bulkCancelRequest, xCorrelationId, idempotencyKey)

Cancel multiple delayed signals in one call

Deletes multiple WaitingEvent rows in a single database round-trip. Designed for the scenario where an operator delayed 200 alarms during a false-alarm storm and then fixed the cause — cancelling them one at a time is not usable. Returns the count actually deleted (some may have expired between listing and cancelling).

### Example

```ts
import {
  Configuration,
  WaitingEventsApi,
} from '';
import type { CancelWaitingEventsBulkRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new WaitingEventsApi(config);

  const body = {
    // BulkCancelRequest
    bulkCancelRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CancelWaitingEventsBulkRequest;

  try {
    const data = await api.cancelWaitingEventsBulk(body);
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
| **bulkCancelRequest** | [BulkCancelRequest](BulkCancelRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**BulkCancelResponse**](BulkCancelResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listWaitingEvents

> WaitingEventListItemPagedResult listWaitingEvents(sideId, sideNo, activeOnly, cursor, limit, offset, page, pageSize, xCorrelationId)

List delayed signals (waiting events) visible to the caller\&#39;s monitoring centre

Returns WaitingEvent rows — signals whose alarm was delayed. Defaults to active waiting events only (DelayTime in the future). Filter by ?sideId&#x3D; or ?sideNo&#x3D; to narrow to a specific subscriber. Pass ?activeOnly&#x3D;false to include expired events.

### Example

```ts
import {
  Configuration,
  WaitingEventsApi,
} from '';
import type { ListWaitingEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new WaitingEventsApi(config);

  const body = {
    // string (optional)
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // number (optional)
    sideNo: 56,
    // boolean (optional)
    activeOnly: true,
    // string (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
    // number (optional)
    page: 56,
    // number (optional)
    pageSize: 56,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies ListWaitingEventsRequest;

  try {
    const data = await api.listWaitingEvents(body);
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
| **sideId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sideNo** | `number` |  | [Optional] [Defaults to `undefined`] |
| **activeOnly** | `boolean` |  | [Optional] [Defaults to `true`] |
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **offset** | `number` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **pageSize** | `number` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**WaitingEventListItemPagedResult**](WaitingEventListItemPagedResult.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Unauthorized |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

