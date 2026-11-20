# CopilotApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**completeCopilotLlm**](CopilotApi.md#completecopilotllm) | **POST** /v1/copilot/llm/completions | Run one call-copilot model call on the installation\&#39;s AI settings |
| [**ingestCopilotConversationEvents**](CopilotApi.md#ingestcopilotconversationevents) | **POST** /v1/copilot/conversation-events | Relay live call transcript events to the operator\&#39;s console |
| [**listCopilotOperatorExtensions**](CopilotApi.md#listcopilotoperatorextensions) | **GET** /v1/copilot/operator-extensions | Mirrors who would actually receive a transcript frame. &#x60;StreamHub.PassesFilter&#x60; delivers when the event names a monitoring centre and the connection names one only if they match; a null on either side passes. So with a centre on the request this lists users of that centre plus users of no centre, and without one it lists everybody. |



## completeCopilotLlm

> CopilotLlmCompletionResponse completeCopilotLlm(xCorrelationId, idempotencyKey, copilotLlmCompletionRequest)

Run one call-copilot model call on the installation\&#39;s AI settings

Internal endpoint for CopilotX (AI task &#x60;copilot&#x60;, D90). &#x60;mode&#x3D;off&#x60;: the task is turned off in the console, call no model. &#x60;mode&#x3D;default&#x60;: no model is chosen, use CopilotX\&#39;s own model. &#x60;mode&#x3D;model&#x60;: the call ran on the chosen model with the installation\&#39;s gateway key; &#x60;text&#x60; is the answer, or null when the call failed. Usage is recorded for the AI tab. Requires the X-Service-Api-Key header.

### Example

```ts
import {
  Configuration,
  CopilotApi,
} from '';
import type { CompleteCopilotLlmRequest } from '';

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
    // CopilotLlmCompletionRequest (optional)
    copilotLlmCompletionRequest: ...,
  } satisfies CompleteCopilotLlmRequest;

  try {
    const data = await api.completeCopilotLlm(body);
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
| **copilotLlmCompletionRequest** | [CopilotLlmCompletionRequest](CopilotLlmCompletionRequest.md) |  | [Optional] |

### Return type

[**CopilotLlmCompletionResponse**](CopilotLlmCompletionResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


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


## listCopilotOperatorExtensions

> CopilotOperatorExtensionsResponse listCopilotOperatorExtensions(xCorrelationId)

Mirrors who would actually receive a transcript frame. &#x60;StreamHub.PassesFilter&#x60; delivers when the event names a monitoring centre and the connection names one only if they match; a null on either side passes. So with a centre on the request this lists users of that centre plus users of no centre, and without one it lists everybody.

Internal endpoint for CopilotX (D95). Returns the distinct extensions of active operator users, as strings in ordinal order, so CopilotX transcribes only operator calls. When the request names a monitoring centre (X-MonitoringCenter-Id), users of that centre and users without a centre are listed — the same users whose consoles would receive a transcript frame; without a centre, all of them. CopilotX polls this and keeps its last list if the call fails. Requires the X-Service-Api-Key header — a bearer token is refused with COPILOT.SERVICE_ONLY.

### Example

```ts
import {
  Configuration,
  CopilotApi,
} from '';
import type { ListCopilotOperatorExtensionsRequest } from '';

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
  } satisfies ListCopilotOperatorExtensionsRequest;

  try {
    const data = await api.listCopilotOperatorExtensions(body);
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

[**CopilotOperatorExtensionsResponse**](CopilotOperatorExtensionsResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

