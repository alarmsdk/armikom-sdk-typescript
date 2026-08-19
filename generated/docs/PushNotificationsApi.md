# PushNotificationsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**sendCustomerPush**](PushNotificationsApi.md#sendcustomerpush) | **POST** /v1/customers/{customerId}/push | Queue push notifications for all subscribers of a customer |
| [**sendSidePush**](PushNotificationsApi.md#sendsidepush) | **POST** /v1/sides/{sideId}/push | Queue push notifications for a subscriber\&#39;s mobile app users |



## sendCustomerPush

> SendPushResponse sendCustomerPush(customerId, sendPushRequest, xCorrelationId, idempotencyKey)

Queue push notifications for all subscribers of a customer

Fans out over every subscriber of the customer, resolves mobile users and eligible devices, de-duplicates devices shared across subscribers so one mobile user linked to multiple subscribers of the same customer receives exactly one notification. A 200 response means \&#39;queued\&#39;, not \&#39;delivered\&#39;.

### Example

```ts
import {
  Configuration,
  PushNotificationsApi,
} from '';
import type { SendCustomerPushRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PushNotificationsApi(config);

  const body = {
    // string
    customerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SendPushRequest
    sendPushRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SendCustomerPushRequest;

  try {
    const data = await api.sendCustomerPush(body);
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
| **customerId** | `string` |  | [Defaults to `undefined`] |
| **sendPushRequest** | [SendPushRequest](SendPushRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**SendPushResponse**](SendPushResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sendSidePush

> SendPushResponse sendSidePush(sideId, sendPushRequest, xCorrelationId, idempotencyKey)

Queue push notifications for a subscriber\&#39;s mobile app users

Resolves mobile users linked to the subscriber, selects devices where IsActive is true and FcmToken is populated, then inserts one MobileMessage row per device with SentAt &#x3D; null. PushNotificationJob in Armikom.Engine polls these rows and dispatches via Firebase Cloud Messaging. A 200 response with queuedCount &gt; 0 means \&#39;queued\&#39;, not \&#39;delivered\&#39;. Zero eligible devices returns 200 with queuedCount &#x3D; 0 and a sideEffects entry naming the reason.

### Example

```ts
import {
  Configuration,
  PushNotificationsApi,
} from '';
import type { SendSidePushRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PushNotificationsApi(config);

  const body = {
    // string
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SendPushRequest
    sendPushRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SendSidePushRequest;

  try {
    const data = await api.sendSidePush(body);
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
| **sideId** | `string` |  | [Defaults to `undefined`] |
| **sendPushRequest** | [SendPushRequest](SendPushRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**SendPushResponse**](SendPushResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

