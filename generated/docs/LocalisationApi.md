# LocalisationApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteTranslationOverride**](LocalisationApi.md#deletetranslationoverride) | **DELETE** /v1/admin/translation-overrides/{culture}/{key} | Remove an override; the console returns to its shipped text |
| [**getLocalizationBundle**](LocalisationApi.md#getlocalizationbundle) | **GET** /v1/i18n/{culture} | Get localisation bundle for a culture |
| [**getSupportedCultures**](LocalisationApi.md#getsupportedcultures) | **GET** /v1/i18n | List supported cultures |
| [**getTranslationOverrides**](LocalisationApi.md#gettranslationoverrides) | **GET** /v1/i18n/overrides | Get the tenant\&#39;s console text overrides |
| [**listTranslationOverrides**](LocalisationApi.md#listtranslationoverrides) | **GET** /v1/admin/translation-overrides | List translation overrides with who changed them last |
| [**setTranslationOverride**](LocalisationApi.md#settranslationoverrideoperation) | **PUT** /v1/admin/translation-overrides/{culture}/{key} | Create or replace the override of one console text in one culture |



## deleteTranslationOverride

> deleteTranslationOverride(culture, key, xCorrelationId)

Remove an override; the console returns to its shipped text

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { DeleteTranslationOverrideRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LocalisationApi(config);

  const body = {
    // string
    culture: culture_example,
    // string
    key: key_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies DeleteTranslationOverrideRequest;

  try {
    const data = await api.deleteTranslationOverride(body);
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
| **key** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **503** | Service Unavailable |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


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


## getTranslationOverrides

> TranslationOverridesResponse getTranslationOverrides(xCorrelationId)

Get the tenant\&#39;s console text overrides

Culture → key → text, applied by the console over its shipped catalogue. Anonymous so the login screen uses them too; carries no editor names. Empty when the tenant has none or has not applied the migration. Supports If-None-Match.

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { GetTranslationOverridesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const api = new LocalisationApi();

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetTranslationOverridesRequest;

  try {
    const data = await api.getTranslationOverrides(body);
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

[**TranslationOverridesResponse**](TranslationOverridesResponse.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **304** | Not Modified |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listTranslationOverrides

> Array&lt;TranslationOverrideItem&gt; listTranslationOverrides(xCorrelationId)

List translation overrides with who changed them last

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { ListTranslationOverridesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LocalisationApi(config);

  const body = {
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies ListTranslationOverridesRequest;

  try {
    const data = await api.listTranslationOverrides(body);
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

[**Array&lt;TranslationOverrideItem&gt;**](TranslationOverrideItem.md)

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


## setTranslationOverride

> TranslationOverrideItem setTranslationOverride(culture, key, setTranslationOverrideRequest, xCorrelationId)

Create or replace the override of one console text in one culture

### Example

```ts
import {
  Configuration,
  LocalisationApi,
} from '';
import type { SetTranslationOverrideOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new LocalisationApi(config);

  const body = {
    // string
    culture: culture_example,
    // string
    key: key_example,
    // SetTranslationOverrideRequest
    setTranslationOverrideRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies SetTranslationOverrideOperationRequest;

  try {
    const data = await api.setTranslationOverride(body);
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
| **key** | `string` |  | [Defaults to `undefined`] |
| **setTranslationOverrideRequest** | [SetTranslationOverrideRequest](SetTranslationOverrideRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**TranslationOverrideItem**](TranslationOverrideItem.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **503** | Service Unavailable |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

