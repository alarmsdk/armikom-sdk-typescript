# ClosingDelaysApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**cancelClosingDelay**](ClosingDelaysApi.md#cancelclosingdelay) | **DELETE** /v1/closing-delays/{id} | Cancel (delete) a closing delay |
| [**listClosingDelays**](ClosingDelaysApi.md#listclosingdelays) | **GET** /v1/closing-delays | List closing delays visible to the caller\&#39;s monitoring centre |



## cancelClosingDelay

> cancelClosingDelay(id, xCorrelationId)

Cancel (delete) a closing delay

Deletes the ClosingDelay row. An active delay (ProcessedAt null) stops suppressing the \&#39;did not close on time\&#39; alarm (CLL) on Engine\&#39;s next OpeningClosingCheckJob run, and ClosingPostponeJob will no longer raise a CLL for it. A processed row can also be deleted to clear history; that has no effect on Engine.

### Example

```ts
import {
  Configuration,
  ClosingDelaysApi,
} from '';
import type { CancelClosingDelayRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ClosingDelaysApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies CancelClosingDelayRequest;

  try {
    const data = await api.cancelClosingDelay(body);
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


## listClosingDelays

> ClosingDelayListItemPagedResult listClosingDelays(sideId, activeOnly, cursor, limit, offset, page, pageSize, xCorrelationId)

List closing delays visible to the caller\&#39;s monitoring centre

Returns ClosingDelay rows — deferred closing-time entries created by operators. Filter by ?sideId&#x3D; to narrow to a specific subscriber. ProcessedAt indicates whether Engine has consumed the delay. By default only active delays (ProcessedAt null) are returned; pass ?activeOnly&#x3D;false to include processed history.

### Example

```ts
import {
  Configuration,
  ClosingDelaysApi,
} from '';
import type { ListClosingDelaysRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ClosingDelaysApi(config);

  const body = {
    // string (optional)
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
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
  } satisfies ListClosingDelaysRequest;

  try {
    const data = await api.listClosingDelays(body);
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
| **activeOnly** | `boolean` |  | [Optional] [Defaults to `true`] |
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **offset** | `number` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **pageSize** | `number` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**ClosingDelayListItemPagedResult**](ClosingDelayListItemPagedResult.md)

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

