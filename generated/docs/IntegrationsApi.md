# IntegrationsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getIntegrationEventStream**](IntegrationsApi.md#getintegrationeventstream) | **GET** /v1/integrations/events/stream | Server-Sent Events stream of integration events |
| [**getIntegrationEvents**](IntegrationsApi.md#getintegrationevents) | **GET** /v1/integrations/events | Poll integration events after a cursor |
| [**getIntegrationMe**](IntegrationsApi.md#getintegrationme) | **GET** /v1/integrations/me | Return the calling integration\&#39;s scope |



## getIntegrationEventStream

> getIntegrationEventStream(after, types, xCorrelationId)

Server-Sent Events stream of integration events

Same events and cursor as the poll endpoint. Resume with Last-Event-ID, or with &#x60;after&#x60; when the header is absent. A keep-alive comment is sent on the configured interval (default 25 seconds). &#x60;event: resync-required&#x60; means this connection cannot continue from the cursor: catch up with the poll endpoint, then reconnect. At most the key\&#39;s maxConcurrentStreams connections at once.

### Example

```ts
import {
  Configuration,
  IntegrationsApi,
} from '';
import type { GetIntegrationEventStreamRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
  });
  const api = new IntegrationsApi(config);

  const body = {
    // string (optional)
    after: after_example,
    // string (optional)
    types: types_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetIntegrationEventStreamRequest;

  try {
    const data = await api.getIntegrationEventStream(body);
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
| **after** | `string` |  | [Optional] [Defaults to `undefined`] |
| **types** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[ApiKey](../README.md#ApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **400** | Bad Request |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **429** | Too Many Requests |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing, invalid or revoked integration API key |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIntegrationEvents

> IntegrationEventPageDto getIntegrationEvents(after, limit, types, xCorrelationId)

Poll integration events after a cursor

Returns events in ascending cursor order for the API key\&#39;s monitoring centre (and dealer, when the key is bound to one). Omit &#x60;after&#x60; only on the first run: the server starts from now and does not return history. &#x60;limit&#x60; is 1–500, default 100. &#x60;types&#x60; is a comma-separated subset of the key\&#39;s event types. A cursor older than the retention window returns 410 INTEGRATION.CURSOR_EXPIRED.

### Example

```ts
import {
  Configuration,
  IntegrationsApi,
} from '';
import type { GetIntegrationEventsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
  });
  const api = new IntegrationsApi(config);

  const body = {
    // string (optional)
    after: after_example,
    // number (optional)
    limit: 56,
    // string (optional)
    types: types_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetIntegrationEventsRequest;

  try {
    const data = await api.getIntegrationEvents(body);
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
| **after** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **types** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**IntegrationEventPageDto**](IntegrationEventPageDto.md)

### Authorization

[ApiKey](../README.md#ApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **400** | Bad Request |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **410** | Gone |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **429** | Too Many Requests |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing, invalid or revoked integration API key |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getIntegrationMe

> IntegrationMeDto getIntegrationMe(xCorrelationId)

Return the calling integration\&#39;s scope

Requires Authorization: ApiKey. The monitoring centre is the one stored on the client, never a value from the request. Its name is null when that centre row is gone.

### Example

```ts
import {
  Configuration,
  IntegrationsApi,
} from '';
import type { GetIntegrationMeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
  });
  const api = new IntegrationsApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetIntegrationMeRequest;

  try {
    const data = await api.getIntegrationMe(body);
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

[**IntegrationMeDto**](IntegrationMeDto.md)

### Authorization

[ApiKey](../README.md#ApiKey)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Unauthorized |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

