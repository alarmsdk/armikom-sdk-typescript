# AdministrationApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**bulkHashPasswords**](AdministrationApi.md#bulkhashpasswords) | **POST** /v1/admin/password-bulk-hash | Bulk-hash all remaining plaintext passwords |



## bulkHashPasswords

> BulkHashResult bulkHashPasswords(dryRun, xCorrelationId, idempotencyKey)

Bulk-hash all remaining plaintext passwords

Hashes every plaintext password in both TechnicalPerson and MobileUser tables using PBKDF2-SHA256. Re-runnable: rows that already carry the $pbkdf2-sha256$ prefix are skipped. Use dryRun&#x3D;true to count without modifying data.

### Example

```ts
import {
  Configuration,
  AdministrationApi,
} from '';
import type { BulkHashPasswordsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdministrationApi(config);

  const body = {
    // boolean (optional)
    dryRun: true,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies BulkHashPasswordsRequest;

  try {
    const data = await api.bulkHashPasswords(body);
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
| **dryRun** | `boolean` |  | [Optional] [Defaults to `true`] |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**BulkHashResult**](BulkHashResult.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **403** | Forbidden |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

