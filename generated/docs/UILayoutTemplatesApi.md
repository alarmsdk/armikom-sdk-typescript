# UILayoutTemplatesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteUiLayoutTemplateById**](UILayoutTemplatesApi.md#deleteuilayouttemplatebyid) | **DELETE** /v1/ui-layout-templates/{screen}/{templateId} | Delete a layout template from the MC pool |
| [**getActiveUiLayoutTemplate**](UILayoutTemplatesApi.md#getactiveuilayouttemplate) | **GET** /v1/ui-layout-templates/{screen}/active | Get the active template id for a screen |
| [**listUiLayoutTemplates**](UILayoutTemplatesApi.md#listuilayouttemplates) | **GET** /v1/ui-layout-templates/{screen} | List all layout templates in the MC pool for a screen |
| [**saveUiLayoutTemplate**](UILayoutTemplatesApi.md#saveuilayouttemplate) | **PUT** /v1/ui-layout-templates/{screen} | Publish monitoring center layout template for a screen (legacy) |
| [**saveUiLayoutTemplateById**](UILayoutTemplatesApi.md#saveuilayouttemplatebyid) | **PUT** /v1/ui-layout-templates/{screen}/{templateId} | Create or update a layout template in the MC pool |
| [**setActiveUiLayoutTemplate**](UILayoutTemplatesApi.md#setactiveuilayouttemplate) | **PUT** /v1/ui-layout-templates/{screen}/active | Set the active template for a screen |



## deleteUiLayoutTemplateById

> deleteUiLayoutTemplateById(screen, templateId, xCorrelationId)

Delete a layout template from the MC pool

Requires admin:config scope. Removes a single template identified by templateId.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { DeleteUiLayoutTemplateByIdRequest } from '';

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
    // string
    templateId: templateId_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies DeleteUiLayoutTemplateByIdRequest;

  try {
    const data = await api.deleteUiLayoutTemplateById(body);
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
| **templateId** | `string` |  | [Defaults to `undefined`] |
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
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## getActiveUiLayoutTemplate

> UiLayoutActiveTemplateResponse getActiveUiLayoutTemplate(screen, xCorrelationId)

Get the active template id for a screen

Returns which template id is currently active for the MC. Returns 404 when no active template is set — the client uses the shipped default.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { GetActiveUiLayoutTemplateRequest } from '';

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
  } satisfies GetActiveUiLayoutTemplateRequest;

  try {
    const data = await api.getActiveUiLayoutTemplate(body);
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

[**UiLayoutActiveTemplateResponse**](UiLayoutActiveTemplateResponse.md)

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


## listUiLayoutTemplates

> UiLayoutTemplateListResponse listUiLayoutTemplates(screen, xCorrelationId)

List all layout templates in the MC pool for a screen

Returns the full pool of templates for the caller\&#39;s monitoring center, plus the id of the currently active template. An empty list means no custom templates exist — the client uses the shipped default.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { ListUiLayoutTemplatesRequest } from '';

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
  } satisfies ListUiLayoutTemplatesRequest;

  try {
    const data = await api.listUiLayoutTemplates(body);
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

[**UiLayoutTemplateListResponse**](UiLayoutTemplateListResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## saveUiLayoutTemplate

> saveUiLayoutTemplate(screen, saveUiLayoutRequest, xCorrelationId)

Publish monitoring center layout template for a screen (legacy)

Requires admin:config scope. Upserts a single template for the caller\&#39;s monitoring center. Prefer the pool endpoints (/{screen}/{templateId}) for new code.

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


## saveUiLayoutTemplateById

> saveUiLayoutTemplateById(screen, templateId, saveUiLayoutRequest, xCorrelationId)

Create or update a layout template in the MC pool

Requires admin:config scope. Upserts a single template identified by templateId for the caller\&#39;s monitoring center.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { SaveUiLayoutTemplateByIdRequest } from '';

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
    // string
    templateId: templateId_example,
    // SaveUiLayoutRequest
    saveUiLayoutRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies SaveUiLayoutTemplateByIdRequest;

  try {
    const data = await api.saveUiLayoutTemplateById(body);
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
| **templateId** | `string` |  | [Defaults to `undefined`] |
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


## setActiveUiLayoutTemplate

> setActiveUiLayoutTemplate(screen, setActiveTemplateRequest, xCorrelationId)

Set the active template for a screen

Requires admin:config scope. Sets which template id all operators in this MC will render.

### Example

```ts
import {
  Configuration,
  UILayoutTemplatesApi,
} from '';
import type { SetActiveUiLayoutTemplateRequest } from '';

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
    // SetActiveTemplateRequest
    setActiveTemplateRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies SetActiveUiLayoutTemplateRequest;

  try {
    const data = await api.setActiveUiLayoutTemplate(body);
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
| **setActiveTemplateRequest** | [SetActiveTemplateRequest](SetActiveTemplateRequest.md) |  | |
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

