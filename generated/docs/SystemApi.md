# SystemApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getCutoverHealth**](SystemApi.md#getcutoverhealth) | **GET** /health/cutover | Cutover convergence health check (C5) |



## getCutoverHealth

> CutoverHealthResponse getCutoverHealth(xCorrelationId)

Cutover convergence health check (C5)

Returns notification counts (SMS sent, emails queued/sent, push messages) for the last 24 hours compared against the R4.2 production baseline (~724 SMS/day at HKM). A significant drop flags the hop as unhealthy. Also reports system signal generation counts.

### Example

```ts
import {
  Configuration,
  SystemApi,
} from '';
import type { GetCutoverHealthRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new SystemApi();

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetCutoverHealthRequest;

  try {
    const data = await api.getCutoverHealth(body);
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

[**CutoverHealthResponse**](CutoverHealthResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

