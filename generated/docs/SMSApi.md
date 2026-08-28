# SMSApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getSignalEventSmsTemplate**](SMSApi.md#getsignaleventsmstemplate) | **GET** /v1/signal-events/{id}/sms-template | Get SMS template for a signal event |
| [**sendSideSms**](SMSApi.md#sendsidesms) | **POST** /v1/sides/{sideId}/sms | Queue SMS messages for a subscriber\&#39;s contacts |



## getSignalEventSmsTemplate

> SmsTemplateResponse getSignalEventSmsTemplate(id, xCorrelationId)

Get SMS template for a signal event

Returns a pre-formatted SMS body using the subscriber\&#39;s side number, name, event name, and event time rendered in the subscriber\&#39;s timezone. Also returns the contact list ordered by RowNo. Phone numbers in this response are personal data, gated on sms:send scope. When the side has exactly one contact, \&#39;preselected\&#39; is true as a client hint.

### Example

```ts
import {
  Configuration,
  SMSApi,
} from '';
import type { GetSignalEventSmsTemplateRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SMSApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
  } satisfies GetSignalEventSmsTemplateRequest;

  try {
    const data = await api.getSignalEventSmsTemplate(body);
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

[**SmsTemplateResponse**](SmsTemplateResponse.md)

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## sendSideSms

> SendSmsResponse sendSideSms(sideId, sendSmsRequest, xCorrelationId, idempotencyKey)

Queue SMS messages for a subscriber\&#39;s contacts

Resolves recipient phone numbers from the subscriber\&#39;s contacts and inserts rows into the SMS queue table. SmsService polls the table every 5 seconds and dispatches via SmsSenderFactory. Recipients can be \&#39;first-contact\&#39; (default), \&#39;explicit\&#39; (provide Phones), or \&#39;contacts\&#39; (provide ContactIds). All three phone numbers (Phone1, Phone2, Phone3) are used when populated and distinct. The \&#39;recall\&#39; and \&#39;note\&#39; fields are stored but no call-back system consumes them today.

### Example

```ts
import {
  Configuration,
  SMSApi,
} from '';
import type { SendSideSmsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: Bearer
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new SMSApi(config);

  const body = {
    // string
    sideId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SendSmsRequest
    sendSmsRequest: ...,
    // string | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. (optional)
    xCorrelationId: xCorrelationId_example,
    // string | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. (optional)
    idempotencyKey: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies SendSideSmsRequest;

  try {
    const data = await api.sendSideSms(body);
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
| **sendSmsRequest** | [SendSmsRequest](SendSmsRequest.md) |  | |
| **xCorrelationId** | `string` | Optional correlation identifier for distributed tracing. If omitted, the server generates one. Echoed back in the response. | [Optional] [Defaults to `undefined`] |
| **idempotencyKey** | `string` | UUID idempotency key. When present, the server guarantees at-most-once execution for the same key+endpoint within 24 hours. | [Optional] [Defaults to `undefined`] |

### Return type

[**SendSmsResponse**](SendSmsResponse.md)

### Authorization

[Bearer](../README.md#Bearer)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`, `application/problem+json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  * Idempotency-Replayed - Set to \&quot;true\&quot; when the response is a replay of a previously completed request. <br>  |
| **401** | Missing or invalid access token |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **403** | Authenticated but missing the required scope |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **404** | Not Found |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |
| **422** | Unprocessable Content |  * X-Correlation-Id - The correlation identifier for this request (echoed or generated). <br>  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

