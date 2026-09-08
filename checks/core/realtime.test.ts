/**
 * §01 §12 — realtime conformance: C-17, C-18, C-19, C-21, C-22.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { Connectivity } from '../../src/core/connectivity.js';
import { EventStream, PollingFallback, type StreamEvent } from '../../src/core/realtime.js';
import { SseParser } from '../../src/core/sse.js';
import type { Transport } from '../../src/core/transport.js';
import { sseTransport, until } from './_harness.js';

const fastBackoff = { maxAttempts: Number.POSITIVE_INFINITY, baseDelayMs: 1, factor: 1, maxDelayMs: 2, jitter: 'none' as const };

test('C-19 resync is emitted on every open, including the first', async () => {
  let resyncs = 0;
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ chunks: ['event: signal-events\ndata: {"id":1}\n\n'] }),
    backoff: fastBackoff,
  });
  stream.onResync(() => (resyncs += 1));

  stream.start();
  await until(() => resyncs >= 2, 3_000);
  await stream.dispose();

  // Two opens (the stream closes after its chunks and reconnects) => two resyncs.
  assert.ok(resyncs >= 2, 'anything published during the gap is lost; the consumer must re-read');
});

test('C-21 a 403 stops the stream permanently', async () => {
  let connects = 0;
  const transport: Transport = async (request) => {
    connects += 1;
    return sseTransport({ status: 403 })(request);
  };
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport,
    backoff: fastBackoff,
  });

  stream.start();
  await until(() => stream.status.get() === 'forbidden', 2_000);
  await new Promise((resolve) => setTimeout(resolve, 50));
  await stream.dispose();

  assert.equal(connects, 1, 'a mobile principal must not reconnect-loop against a 403');
});

test('C-22 the keep-alive watchdog reconnects a silent stream', async () => {
  let connects = 0;
  const transport: Transport = async (request) => {
    connects += 1;
    // Opens and then says nothing at all — a half-open socket behind an ingress.
    return sseTransport({ keepOpen: true })(request);
  };
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport,
    backoff: fastBackoff,
    keepAliveTimeoutMs: 40,
  });

  stream.start();
  await until(() => connects >= 2, 3_000);
  await stream.dispose();
  assert.ok(connects >= 2, 'silence past 2.5 heartbeats means the connection is dead');
});

test('C-17 fifty nudges in a burst produce exactly one re-read', async () => {
  const nudges = Array.from({ length: 50 }, () => 'event: alarm-list-updated\ndata: {}\n\n').join('');
  let rereads = 0;
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ chunks: [nudges], keepOpen: true }),
    backoff: fastBackoff,
  });
  // The resync on open also triggers the coalescer, so count from a clean slate.
  stream.onNudge('alarm-list-updated', () => (rereads += 1), 30);

  stream.start();
  await new Promise((resolve) => setTimeout(resolve, 200));
  await stream.dispose();

  assert.equal(rereads, 1, 'a re-read per nudge is the client DOSing itself during a storm');
});

test('C-18 an unparseable payload is delivered raw and does not stop the stream', async () => {
  const received: StreamEvent[] = [];
  const chunks = [
    'event: pbx-ringing\ndata: {"caller":"555","unknownField":true}\n\n',
    'event: pbx-ringing\ndata: not json at all\n\n',
    'event: signal-events\ndata: {"id":7}\n\n',
  ];
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ chunks, keepOpen: true }),
    backoff: fastBackoff,
  });
  stream.onAny((event) => received.push(event));

  stream.start();
  await until(() => received.length >= 3, 2_000);
  await stream.dispose();

  assert.equal((received[0]?.data as Record<string, unknown>)['unknownField'], true);
  assert.equal(received[1]?.data, 'not json at all', 'the raw string rather than a thrown parse error');
  assert.equal((received[2]?.data as Record<string, unknown>)['id'], 7, 'events behind the bad one still arrive');
});

test('S-2 an alarm nudge carries an empty payload by design', async () => {
  const received: StreamEvent[] = [];
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ chunks: ['event: alarm-list-updated\ndata: {}\n\n'], keepOpen: true }),
    backoff: fastBackoff,
  });
  stream.on('alarm-list-updated', (event) => received.push(event));

  stream.start();
  await until(() => received.length >= 1, 2_000);
  await stream.dispose();
  assert.deepEqual(received[0]?.data, {});
});

test('S-11 the token is read per connect, so a reconnect carries a fresh one', async () => {
  const seen: Array<string | undefined> = [];
  let token = 'first';
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    getAccessToken: () => token,
    transport: sseTransport({
      chunks: [':keep-alive\n\n'],
      onConnect: (request) => {
        seen.push(request.headers['Authorization']);
        token = 'refreshed';
      },
    }),
    backoff: fastBackoff,
  });

  stream.start();
  await until(() => seen.length >= 2, 3_000);
  await stream.dispose();
  assert.deepEqual(seen.slice(0, 2), ['Bearer first', 'Bearer refreshed']);
});

test('S-10 the polling fallback runs only while the stream is down, and says so', async () => {
  let polls = 0;
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ status: 500 }),
    backoff: fastBackoff,
  });
  const fallback = new PollingFallback({ stream, poll: () => void (polls += 1), intervalMs: 20 });

  fallback.start();
  stream.start();
  await until(() => polls >= 2 && fallback.mode.get() === 'polling', 3_000);
  fallback.stop();
  await stream.dispose();

  assert.equal(fallback.mode.get(), 'stopped');
  assert.ok(polls >= 2, 'silent fallback is forbidden — and it must actually poll');
});

test('the stream reports itself to connectivity', async () => {
  const connectivity = new Connectivity();
  const stream = new EventStream({
    path: '/v1/stream',
    baseUrl: 'https://api.test',
    transport: sseTransport({ chunks: [':ka\n\n'], keepOpen: true }),
    backoff: fastBackoff,
    connectivity,
  });

  stream.start();
  await until(() => stream.status.get() === 'open', 2_000);
  assert.equal(connectivity.status.get(), 'online');
  await stream.dispose();
});

test('the frame parser survives chunk boundaries mid-frame', () => {
  const parser = new SseParser();
  assert.deepEqual(parser.push('event: signal-ev'), []);
  assert.deepEqual(parser.push('ents\ndata: {"a":'), []);
  const frames = parser.push('1}\n\n');
  assert.equal(frames.length, 1);
  assert.equal(frames[0]?.event, 'signal-events');
  assert.equal(frames[0]?.data, '{"a":1}');
});

test('the frame parser joins multi-line data and reads comments', () => {
  const parser = new SseParser();
  const comments: string[] = [];
  parser.onComment = (text) => comments.push(text);

  const frames = parser.push(': keep-alive\nevent: x\ndata: one\ndata: two\nid: 42\n\n');
  assert.deepEqual(comments, ['keep-alive']);
  assert.equal(frames[0]?.data, 'one\ntwo');
  assert.equal(frames[0]?.id, '42');
});

test('a chunk boundary between the CR and the LF of a CRLF does not split a frame', () => {
  const parser = new SseParser();
  // The boundary lands mid-terminator: the CR arrives, the LF does not.
  assert.deepEqual(parser.push('event: signal-events\r'), [], 'the lone CR is held back');
  const frames = parser.push('\ndata: {"a":1}\r\n\r\n');
  assert.equal(frames.length, 1, 'exactly one frame, not one truncated and one empty');
  assert.equal(frames[0]?.event, 'signal-events');
  assert.equal(frames[0]?.data, '{"a":1}');
});

test('CR, LF and CRLF are all accepted as terminators', () => {
  const lf = new SseParser().push('event: a\ndata: 1\n\n');
  const crlf = new SseParser().push('event: a\r\ndata: 1\r\n\r\n');
  for (const [name, frames] of [['LF', lf], ['CRLF', crlf]] as const) {
    assert.equal(frames.length, 1, `${name} should terminate a frame`);
    assert.equal(frames[0]?.data, '1', `${name} data`);
  }

  // A CR-terminated stream is the ambiguous case: the final CR cannot be
  // dispatched on, because the very next byte might be the LF that makes it a
  // CRLF. It is held until something resolves it — more data, or a flush.
  const cr = new SseParser();
  assert.deepEqual(cr.push('event: a\rdata: 1\r\r'), [], 'the trailing CR is pending, not dropped');
  const flushed = cr.flush();
  assert.equal(flushed?.data, '1', 'and flush resolves it');
});
