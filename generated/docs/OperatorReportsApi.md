# OperatorReportsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getOperatorCallSummary**](OperatorReportsApi.md#getoperatorcallsummary) | **GET** /v1/reports/operators/call-summary | Per-operator call summary from PBX records |
| [**getOperatorComparison**](OperatorReportsApi.md#getoperatorcomparison) | **GET** /v1/reports/operators/comparison | Side-by-side operator comparison |
| [**getOperatorDataEntrySummary**](OperatorReportsApi.md#getoperatordataentrysummary) | **GET** /v1/reports/operators/data-entry-summary | Per-operator data entry summary |
| [**getOperatorScreenTime**](OperatorReportsApi.md#getoperatorscreentime) | **GET** /v1/reports/operators/screen-time | Per-operator screen time and presence |
| [**getOperatorSignalSummary**](OperatorReportsApi.md#getoperatorsignalsummary) | **GET** /v1/reports/operators/signal-summary | Per-operator alarm handling summary |
| [**getSignalResponseTimes**](OperatorReportsApi.md#getsignalresponsetimes) | **GET** /v1/reports/operators/response-times | Per-signal response time chain |



## getOperatorCallSummary

> OperatorCallSummaryResponse getOperatorCallSummary(from, to, monitoringCenterId, xCorrelationId)

Per-operator call summary from PBX records

Returns call counts, talk time, and answered/missed breakdown per PBX extension. Covers (b) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetOperatorCallSummaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetOperatorCallSummaryRequest;

  try {
    const data = await api.getOperatorCallSummary(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**OperatorCallSummaryResponse**](OperatorCallSummaryResponse.md)

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


## getOperatorComparison

> OperatorComparisonResponse getOperatorComparison(from, to, monitoringCenterId, xCorrelationId)

Side-by-side operator comparison

Returns all metrics in one response for side-by-side comparison: signal handling, calls, data entry, and screen time. Use for shift comparisons and monthly awards. Covers (e) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetOperatorComparisonRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetOperatorComparisonRequest;

  try {
    const data = await api.getOperatorComparison(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**OperatorComparisonResponse**](OperatorComparisonResponse.md)

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


## getOperatorDataEntrySummary

> OperatorDataEntrySummaryResponse getOperatorDataEntrySummary(from, to, operatorId, monitoringCenterId, xCorrelationId)

Per-operator data entry summary

Returns action text writes, subscriber creates, approvals, and audited write operations. Covers (c) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetOperatorDataEntrySummaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    operatorId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetOperatorDataEntrySummaryRequest;

  try {
    const data = await api.getOperatorDataEntrySummary(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **operatorId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**OperatorDataEntrySummaryResponse**](OperatorDataEntrySummaryResponse.md)

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


## getOperatorScreenTime

> OperatorScreenTimeSummaryResponse getOperatorScreenTime(from, to, operatorId, monitoringCenterId, xCorrelationId)

Per-operator screen time and presence

Returns total screen dwell time, idle time, and session count. Idle periods are subtracted from dwell to compute active time. Covers (d) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetOperatorScreenTimeRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    operatorId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetOperatorScreenTimeRequest;

  try {
    const data = await api.getOperatorScreenTime(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **operatorId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**OperatorScreenTimeSummaryResponse**](OperatorScreenTimeSummaryResponse.md)

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


## getOperatorSignalSummary

> OperatorSignalSummaryResponse getOperatorSignalSummary(from, to, operatorId, monitoringCenterId, xCorrelationId)

Per-operator alarm handling summary

Returns how many alarms each operator completed, quick-completed, batch-completed, and batch-delayed in the given date range. Scoped to the caller\&#39;s monitoring centre; monitoringCenterId narrows a cross-centre operator\&#39;s report to one centre. Covers (a) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetOperatorSignalSummaryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    operatorId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetOperatorSignalSummaryRequest;

  try {
    const data = await api.getOperatorSignalSummary(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **operatorId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**OperatorSignalSummaryResponse**](OperatorSignalSummaryResponse.md)

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


## getSignalResponseTimes

> SignalResponseTimeResponse getSignalResponseTimes(from, to, operatorId, monitoringCenterId, page, pageSize, xCorrelationId)

Per-signal response time chain

Returns the timing chain for each signal: queued → viewed → locked → completed, with aggregate percentiles. Answers \&#39;how fast do we close each alarm type\&#39;. Covers (f) of the operator report requirements.

### Example

```ts
import {
  Configuration,
  OperatorReportsApi,
} from '';
import type { GetSignalResponseTimesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OperatorReportsApi(config);

  const body = {
    // Date
    from: 2013-10-20T19:20:30+01:00,
    // Date
    to: 2013-10-20T19:20:30+01:00,
    // string (optional)
    operatorId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // number (optional)
    page: 56,
    // number (optional)
    pageSize: 56,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSignalResponseTimesRequest;

  try {
    const data = await api.getSignalResponseTimes(body);
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
| **from** | `Date` |  | [Defaults to `undefined`] |
| **to** | `Date` |  | [Defaults to `undefined`] |
| **operatorId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `1`] |
| **pageSize** | `number` |  | [Optional] [Defaults to `50`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**SignalResponseTimeResponse**](SignalResponseTimeResponse.md)

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

