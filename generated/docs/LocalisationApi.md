# LocalisationApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getLocalizationBundle**](LocalisationApi.md#getlocalizationbundle) | **GET** /v1/i18n/{culture} | Get localisation bundle for a culture |
| [**getSupportedCultures**](LocalisationApi.md#getsupportedcultures) | **GET** /v1/i18n | List supported cultures |



## getLocalizationBundle

> LocalizationBundleResponse getLocalizationBundle(culture, xCorrelationId)

Get localisation bundle for a culture

Returns all localised key-value pairs for the requested culture (tr, en, az). Supports ETag-based caching via If-None-Match. Keys are prefixed by section: UI.*, SMS.*, ERROR.*, ENUM.{Type}.{Value}, ACTION.*.

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { GetLocalizationBundleRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new LocalisationApi();

  const body = {
    // string
    culture: culture_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetLocalizationBundleRequest;

  try {
    const data = await api.getLocalizationBundle(body);
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
| **culture** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**LocalizationBundleResponse**](LocalizationBundleResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **304** | Not Modified |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getSupportedCultures

> Array&lt;string&gt; getSupportedCultures(xCorrelationId)

List supported cultures

Returns the list of supported culture codes.

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { GetSupportedCulturesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new LocalisationApi();

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSupportedCulturesRequest;

  try {
    const data = await api.getSupportedCultures(body);
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

**Array<string>**

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

