# ClosingDelayApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getClosingDelayOptions**](ClosingDelayApi.md#getclosingdelayoptions) | **GET** /v1/sides/{sideId}/closing-delay-options | Get available closing delay modes for a subscriber |
| [**setClosingDelay**](ClosingDelayApi.md#setclosingdelay) | **POST** /v1/signal-events/{id}/closing-delay | Postpone a subscriber\&#39;s expected closing time |



## getClosingDelayOptions

> ClosingDelayOptionsResponse getClosingDelayOptions(sideId, xCorrelationId)

Get available closing delay modes for a subscriber

Returns the available closing delay modes based on whether the subscriber has a timetable. ShiftClosingTime is only available when the subscriber has closing times defined.

### Example

```ts
import {
  Configuration,
  ClosingDelayApi,
} from '';
import type { GetClosingDelayOptionsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ClosingDelayApi(config);

  const body = {
    // string
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetClosingDelayOptionsRequest;

  try {
    const data = await api.getClosingDelayOptions(body);
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
| **sideId** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**ClosingDelayOptionsResponse**](ClosingDelayOptionsResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## setClosingDelay

> ClosingDelayResponse setClosingDelay(id, closingDelayRequest, xCorrelationId, idempotencyKey)

Postpone a subscriber\&#39;s expected closing time

Creates a ClosingDelay row that suppresses the \&#39;did not close on time\&#39; alarm (CLL). Three modes: FromNow (clock + delay), ShiftClosingTime (next timetable closing + delay), CustomDateTime (client supplies the closing date directly). Accepts Minute, Hour, and Day time units for FromNow and ShiftClosingTime modes.

### Example

```ts
import {
  Configuration,
  ClosingDelayApi,
} from '';
import type { SetClosingDelayRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ClosingDelayApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // ClosingDelayRequest
    closingDelayRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SetClosingDelayRequest;

  try {
    const data = await api.setClosingDelay(body);
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
| **closingDelayRequest** | [ClosingDelayRequest](ClosingDelayRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**ClosingDelayResponse**](ClosingDelayResponse.md)

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

