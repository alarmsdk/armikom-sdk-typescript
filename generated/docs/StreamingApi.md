# StreamingApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getStream**](StreamingApi.md#getstream) | **GET** /v1/stream | Server-Sent Events stream for alarm, signal, PBX, and lock changes |



## getStream

> getStream(xCorrelationId, lastEventID)

Server-Sent Events stream for alarm, signal, PBX, and lock changes

Opens a long-lived SSE connection that pushes alarm-list-updated nudges, signal-events batches, pbx-ringing notifications, and side-lock-changed events. Filtered per connection by the caller\&#39;s monitoring center and dealer scope. Every frame carries an id: field for Last-Event-ID resumption (D59). Mobile principals receive 403 — mobile clients use Firebase RTDB (D5). A keep-alive comment is sent every 25 seconds.

### Example

```ts
import {
  Configuration,
  StreamingApi,
} from '';
import type { GetStreamRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StreamingApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | SSE reconnection: the last event id received by the client. The server replays missed events from its ring buffer, or sends a resync-required frame if the buffer has rotated past that id. (optional)
    lastEventID: lastEventID_example,
  } satisfies GetStreamRequest;

  try {
    const data = await api.getStream(body);
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
| **lastEventID** | `string` | SSE reconnection: the last event id received by the client. The server replays missed events from its ring buffer, or sends a resync-required frame if the buffer has rotated past that id. | [Optional] [Defaults to `undefined`] |

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
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **429** | Too Many Requests |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

