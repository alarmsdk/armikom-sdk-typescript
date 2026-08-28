# SignalBlocksApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**cancelSignalBlock**](SignalBlocksApi.md#cancelsignalblock) | **DELETE** /v1/signal-blocks/{id} | Cancel (delete) a signal block — the signal code is immediately unblocked |
| [**listSignalBlocks**](SignalBlocksApi.md#listsignalblocks) | **GET** /v1/signal-blocks | List signal blocks visible to the caller\&#39;s monitoring centre |



## cancelSignalBlock

> cancelSignalBlock(id, xCorrelationId)

Cancel (delete) a signal block — the signal code is immediately unblocked

Deletes the SignalBloke row. Engine\&#39;s IsSignalBlocked queries the database on every incoming signal packet (no cache), so the effect is immediate: the next packet with this code will no longer be suppressed. This matches SignalBlockedJob\&#39;s own expiry behaviour, which also deletes the row.

### Example

```ts
import {
  Configuration,
  SignalBlocksApi,
} from '';
import type { CancelSignalBlockRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalBlocksApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies CancelSignalBlockRequest;

  try {
    const data = await api.cancelSignalBlock(body);
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
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## listSignalBlocks

> SignalBlockListItemPagedResult listSignalBlocks(sideId, sideNo, activeOnly, cursor, limit, offset, page, pageSize, xCorrelationId)

List signal blocks visible to the caller\&#39;s monitoring centre

Returns signal blocks (SignalBloke rows) filtered by the caller\&#39;s tenant. All existing rows are returned because Engine\&#39;s IsSignalBlocked considers row existence only — it does not check EndDate. SignalBlockedJob deletes expired rows every 5 minutes. The isExpired flag marks blocks whose EndDate has passed but whose row has not yet been cleaned up. Filter by ?sideId&#x3D; or ?sideNo&#x3D; to narrow to a specific subscriber.

### Example

```ts
import {
  Configuration,
  SignalBlocksApi,
} from '';
import type { ListSignalBlocksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SignalBlocksApi(config);

  const body = {
    // string (optional)
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // number (optional)
    sideNo: 56,
    // boolean (optional)
    activeOnly: true,
    // string (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // number (optional)
    offset: 56,
    // number (optional)
    page: 56,
    // number (optional)
    pageSize: 56,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies ListSignalBlocksRequest;

  try {
    const data = await api.listSignalBlocks(body);
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
| **sideId** | `string` |  | [Optional] [Defaults to `undefined`] |
| **sideNo** | `number` |  | [Optional] [Defaults to `undefined`] |
| **activeOnly** | `boolean` |  | [Optional] [Defaults to `true`] |
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **offset** | `number` |  | [Optional] [Defaults to `undefined`] |
| **page** | `number` |  | [Optional] [Defaults to `undefined`] |
| **pageSize** | `number` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**SignalBlockListItemPagedResult**](SignalBlockListItemPagedResult.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Unauthorized |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

