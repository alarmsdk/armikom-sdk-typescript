# UILayoutTemplatesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getUiLayoutTemplate**](UILayoutTemplatesApi.md#getuilayouttemplate) | **GET** /v1/ui-layout-templates/{screen} | Get monitoring center published layout template for a screen |
| [**saveUiLayoutTemplate**](UILayoutTemplatesApi.md#saveuilayouttemplate) | **PUT** /v1/ui-layout-templates/{screen} | Publish monitoring center layout template for a screen |



## getUiLayoutTemplate

> UiLayoutResponse getUiLayoutTemplate(screen, xCorrelationId)

Get monitoring center published layout template for a screen

Returns 404 when no template is published — the client uses the shipped default.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { GetUiLayoutTemplateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UILayoutTemplatesApi(config);

  const body = {
    // string
    screen: screen_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetUiLayoutTemplateRequest;

  try {
    const data = await api.getUiLayoutTemplate(body);
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
| **screen** | `string` |  | [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**UiLayoutResponse**](UiLayoutResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## saveUiLayoutTemplate

> saveUiLayoutTemplate(screen, saveUiLayoutRequest, xCorrelationId)

Publish monitoring center layout template for a screen

Requires admin:config scope. Upserts the template for the caller\&#39;s monitoring center.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { SaveUiLayoutTemplateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new UILayoutTemplatesApi(config);

  const body = {
    // string
    screen: screen_example,
    // SaveUiLayoutRequest
    saveUiLayoutRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies SaveUiLayoutTemplateRequest;

  try {
    const data = await api.saveUiLayoutTemplate(body);
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
| **screen** | `string` |  | [Defaults to `undefined`] |
| **saveUiLayoutRequest** | [SaveUiLayoutRequest](SaveUiLayoutRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

