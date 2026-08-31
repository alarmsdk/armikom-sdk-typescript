# CopilotApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**ingestCopilotConversationEvents**](CopilotApi.md#ingestcopilotconversationevents) | **POST** /v1/copilot/conversation-events | Relay live call transcript events to the operator\&#39;s console |



## ingestCopilotConversationEvents

> CopilotConversationIngestResponse ingestCopilotConversationEvents(xCorrelationId, idempotencyKey, copilotConversationIngestRequest)

Relay live call transcript events to the operator\&#39;s console

Internal endpoint for CopilotX. Each event names the operator\&#39;s PBX extension, and the resulting &#x60;copilot-conversation&#x60; SSE frame reaches only the console whose &#x60;ext&#x60; claim matches — cross-center admins included, since a call has two parties and neither is a supervisor. Nothing is stored: CopilotX owns the transcript, the API only fans it out. Acceptance (202) means published to the connected consoles, not read by anyone. Events that cannot be routed or rendered are dropped individually and reported in &#x60;rejections&#x60;; only an empty or oversized batch fails the request. Requires the X-Service-Api-Key header — a bearer token is refused with COPILOT.SERVICE_ONLY.

### Example

```ts
import {
  Configuration,
  CopilotApi,
} from '';
import type { IngestCopilotConversationEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new CopilotApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // CopilotConversationIngestRequest (optional)
    copilotConversationIngestRequest: ...,
  } satisfies IngestCopilotConversationEventsRequest;

  try {
    const data = await api.ingestCopilotConversationEvents(body);
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
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |
| **copilotConversationIngestRequest** | [CopilotConversationIngestRequest](CopilotConversationIngestRequest.md) |  | [Optional] |

### Return type

[**CopilotConversationIngestResponse**](CopilotConversationIngestResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **202** | Accepted |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

