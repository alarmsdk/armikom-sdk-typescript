# StatisticsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getDashboardCounters**](StatisticsApi.md#getdashboardcounters) | **GET** /v1/dashboard/counters | Dashboard counters for the operator home page |
| [**getDealerSidesByStatus**](StatisticsApi.md#getdealersidesbystatus) | **GET** /v1/dealers/me/sides/by-status | Drill-down list of dealer subscribers by status category |
| [**getDealerStatistics**](StatisticsApi.md#getdealerstatistics) | **GET** /v1/dealers/me/statistics | Statistics for the authenticated dealer\&#39;s subscribers |



## getDashboardCounters

> DashboardCountersResponse getDashboardCounters(xCorrelationId)

Dashboard counters for the operator home page

Returns counts of active alarms, today\&#39;s live signal events, and total active signals. Results are scoped to the operator\&#39;s monitoring center via the global tenant filter.

### Example

```ts
import {
  Configuration,
  StatisticsApi,
} from '';
import type { GetDashboardCountersRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatisticsApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetDashboardCountersRequest;

  try {
    const data = await api.getDashboardCounters(body);
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

[**DashboardCountersResponse**](DashboardCountersResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDealerSidesByStatus

> DealerSidesByStatusResponse getDealerSidesByStatus(type, xCorrelationId)

Drill-down list of dealer subscribers by status category

Returns a list of subscriber details filtered by status type. Valid types: no-signal, communication-lost, communication-restored, technical-service, active, inactive. Dealer ID is derived from the token (R4).

### Example

```ts
import {
  Configuration,
  StatisticsApi,
} from '';
import type { GetDealerSidesByStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatisticsApi(config);

  const body = {
    // string (optional)
    type: type_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetDealerSidesByStatusRequest;

  try {
    const data = await api.getDealerSidesByStatus(body);
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
| **type** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**DealerSidesByStatusResponse**](DealerSidesByStatusResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **400** | Bad Request |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getDealerStatistics

> DealerStatisticsResponse getDealerStatistics(xCorrelationId)

Statistics for the authenticated dealer\&#39;s subscribers

Returns subscriber counts (total, active, inactive, system open/closed), technical service count, signals in the last 7 days, NTS (no signal) sides, and communication lost/restored side counts. Dealer ID is derived from the token (R4).

### Example

```ts
import {
  Configuration,
  StatisticsApi,
} from '';
import type { GetDealerStatisticsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new StatisticsApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetDealerStatisticsRequest;

  try {
    const data = await api.getDealerStatistics(body);
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

[**DealerStatisticsResponse**](DealerStatisticsResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

