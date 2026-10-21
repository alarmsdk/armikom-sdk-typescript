# SearchApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**globalSearch**](SearchApi.md#globalsearch) | **GET** /v1/search | Global search across subscribers, contacts, key holders, mobile users and customers |
| [**globalSearchCounts**](SearchApi.md#globalsearchcounts) | **GET** /v1/search/counts | Per-section match counts for a global search query |



## globalSearch

> SearchResponse globalSearch(q, entityType, limit, skip, includeCount, xCorrelationId)

Global search across subscribers, contacts, key holders, mobile users and customers

Searches across five entity types (Side, SideContact, SideUser, MobileUser, Customer) using ILIKE pattern matching. Returns up to 5 results per section by default, ordered Side → SideContact → SideUser → MobileUser → Customer. Each section includes totalCount for the full match set. Use entityType to filter to a single section, limit to control page size (max 50), and skip for offset-based pagination. includeCount&#x3D;false skips the per-section counts (isCounted is false and totalCount 0; hasMore is still set) so the list returns sooner; fetch the counts afterwards from /v1/search/counts. Contact, key holder and mobile user results navigate to their parent subscriber. Query must be at least 2 characters.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '';
import type { GlobalSearchRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SearchApi(config);

  const body = {
    // string (optional)
    q: q_example,
    // string (optional)
    entityType: entityType_example,
    // number (optional)
    limit: 56,
    // number (optional)
    skip: 56,
    // boolean (optional)
    includeCount: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GlobalSearchRequest;

  try {
    const data = await api.globalSearch(body);
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
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **entityType** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `undefined`] |
| **skip** | `number` |  | [Optional] [Defaults to `undefined`] |
| **includeCount** | `boolean` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**SearchResponse**](SearchResponse.md)

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
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## globalSearchCounts

> SearchCountsResponse globalSearchCounts(q, entityType, xCorrelationId)

Per-section match counts for a global search query

The deferred half of GET /v1/search?includeCount&#x3D;false: the same matching, counts only. Sections with no matches are omitted. entityType narrows to one section.

### Example

```ts
import {
  Configuration,
  SearchApi,
} from '';
import type { GlobalSearchCountsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SearchApi(config);

  const body = {
    // string (optional)
    q: q_example,
    // string (optional)
    entityType: entityType_example,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GlobalSearchCountsRequest;

  try {
    const data = await api.globalSearchCounts(body);
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
| **q** | `string` |  | [Optional] [Defaults to `undefined`] |
| **entityType** | `string` |  | [Optional] [Defaults to `undefined`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |

### Return type

[**SearchCountsResponse**](SearchCountsResponse.md)

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
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

