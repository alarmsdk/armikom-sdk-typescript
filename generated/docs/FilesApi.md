# FilesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getMonitoringCenterAlarmSound**](FilesApi.md#getmonitoringcenteralarmsound) | **GET** /v1/monitoring-centers/{id}/alarm-sound | Download the alarm sound file for a monitoring center |
| [**getServicePhotoContent**](FilesApi.md#getservicephotocontent) | **GET** /v1/service-photos/{photoId}/content | Download a service photo/document by ID |
| [**getSideDocumentContent**](FilesApi.md#getsidedocumentcontent) | **GET** /v1/side-documents/{id}/content | Download a side document by ID |



## getMonitoringCenterAlarmSound

> getMonitoringCenterAlarmSound(id, download, xCorrelationId)

Download the alarm sound file for a monitoring center

Returns the alarm sound audio file configured for the specified monitoring center. Operators can only access their own monitoring center\&#39;s sound.

### Example

```ts
import {
  Configuration,
  FilesApi,
} from '';
import type { GetMonitoringCenterAlarmSoundRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new FilesApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // boolean (optional)
    download: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetMonitoringCenterAlarmSoundRequest;

  try {
    const data = await api.getMonitoringCenterAlarmSound(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |
| **download** | `boolean` |  | [Optional] [Defaults to `false`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getServicePhotoContent

> getServicePhotoContent(photoId, download, xCorrelationId)

Download a service photo/document by ID

Returns the binary content of a service photo or attached document. Scope enforcement ensures only photos belonging to the caller\&#39;s monitoring center (operator) or dealer are accessible. Use &#x60;?download&#x3D;true&#x60; to force an attachment disposition.

### Example

```ts
import {
  Configuration,
  FilesApi,
} from '';
import type { GetServicePhotoContentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new FilesApi(config);

  const body = {
    // string
    photoId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // boolean (optional)
    download: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetServicePhotoContentRequest;

  try {
    const data = await api.getServicePhotoContent(body);
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
| **photoId** | `string` |  | [Defaults to `undefined`] |
| **download** | `boolean` |  | [Optional] [Defaults to `false`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSideDocumentContent

> getSideDocumentContent(id, download, xCorrelationId)

Download a side document by ID

Returns the binary content of a subscriber document. Scope enforcement ensures only documents belonging to the caller\&#39;s monitoring center (operator) or dealer are accessible. Use &#x60;?download&#x3D;true&#x60; to force an attachment disposition.

### Example

```ts
import {
  Configuration,
  FilesApi,
} from '';
import type { GetSideDocumentContentRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new FilesApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // boolean (optional)
    download: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSideDocumentContentRequest;

  try {
    const data = await api.getSideDocumentContent(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |
| **download** | `boolean` |  | [Optional] [Defaults to `false`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

