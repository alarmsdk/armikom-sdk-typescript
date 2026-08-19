# TelephonyApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**dial**](TelephonyApi.md#dialoperation) | **POST** /v1/telephony/dial | Initiate a click-to-dial call via the PBX |



## dial

> DialResponse dial(dialRequest, xCorrelationId, idempotencyKey)

Initiate a click-to-dial call via the PBX

Publishes a dial command on the message bus. Acceptance (202) means the command was published — it does NOT mean the call was placed. The bus is fire-and-forget; there is no delivery signal. The caller\&#39;s PBX extension is read from the &#x60;ext&#x60; JWT claim and cannot be overridden. When signalEventId is supplied, the side\&#39;s monitoring center is used for PBX routing and an action note is appended to the signal event.

### Example

```ts
import {
  Configuration,
  TelephonyApi,
} from '';
import type { DialOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TelephonyApi(config);

  const body = {
    // DialRequest
    dialRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies DialOperationRequest;

  try {
    const data = await api.dial(body);
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
| **dialRequest** | [DialRequest](DialRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**DialResponse**](DialResponse.md)

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
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **503** | Service Unavailable |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

