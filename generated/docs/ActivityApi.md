# ActivityApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**postActivity**](ActivityApi.md#postactivityoperation) | **POST** /v1/activity | Submit usage telemetry events |



## postActivity

> postActivity(postActivityRequest, xCorrelationId, idempotencyKey)

Submit usage telemetry events

Accepts a batch of client-side usage telemetry events (window open/close, tab switching, navigation, action executions). This is NOT an audit trail — it records UI activity for analytics. For domain-write audit, see IAuditService (R4.8). Fire-and-forget on the client: a failed telemetry post must never block navigation or surface to a user. Events are written to the structured log (Seq) with the same property names as XAF\&#39;s UserActivityLoggerController: SessionId, UserId, UserName, SourceContext.

### Example

```ts
import {
  Configuration,
  ActivityApi,
} from '';
import type { PostActivityOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ActivityApi(config);

  const body = {
    // PostActivityRequest
    postActivityRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies PostActivityOperationRequest;

  try {
    const data = await api.postActivity(body);
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
| **postActivityRequest** | [PostActivityRequest](PostActivityRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Accepted |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **429** | Too Many Requests |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

