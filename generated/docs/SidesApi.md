# SidesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getAvailableSideNos**](SidesApi.md#getavailablesidenos) | **GET** /v1/sides/available-side-nos | List all available subscriber numbers in a range (max 2000) |
| [**getNextSideNo**](SidesApi.md#getnextsideno) | **GET** /v1/sides/next-side-no | Get the next available subscriber number for a monitoring center |



## getAvailableSideNos

> AvailableSideNosResponse getAvailableSideNos(start, end, monitoringCenterId, excludeSideId, xCorrelationId)

List all available subscriber numbers in a range (max 2000)

Returns all available numbers in [start, end] by subtracting Side.SideNo (MC-filtered) and DealerSideNo.SideNo (global). Maximum range size is 2000.

### Example

```ts
import {
  Configuration,
  SidesApi,
} from '';
import type { GetAvailableSideNosRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SidesApi(config);

  const body = {
    // number
    start: 56,
    // number
    end: 56,
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string (optional)
    excludeSideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetAvailableSideNosRequest;

  try {
    const data = await api.getAvailableSideNos(body);
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
| **start** | `number` |  | [Defaults to `undefined`] |
| **end** | `number` |  | [Defaults to `undefined`] |
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **excludeSideId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**AvailableSideNosResponse**](AvailableSideNosResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getNextSideNo

> NextSideNoResponse getNextSideNo(monitoringCenterId, start, end, excludeSideId, xCorrelationId)

Get the next available subscriber number for a monitoring center

Computes the first available SideNo in the monitoring center\&#39;s range by subtracting all used Side.SideNo and all reserved DealerSideNo.SideNo values. Range defaults to MC\&#39;s SideNoStart/SideNoEnd if not specified.

### Example

```ts
import {
  Configuration,
  SidesApi,
} from '';
import type { GetNextSideNoRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SidesApi(config);

  const body = {
    // string (optional)
    monitoringCenterId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // number (optional)
    start: 56,
    // number (optional)
    end: 56,
    // string (optional)
    excludeSideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetNextSideNoRequest;

  try {
    const data = await api.getNextSideNo(body);
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
| **monitoringCenterId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **start** | `number` |  | [Optional] [Defaults to `undefined`] |
| **end** | `number` |  | [Optional] [Defaults to `undefined`] |
| **excludeSideId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**NextSideNoResponse**](NextSideNoResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

