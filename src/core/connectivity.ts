/**
 * §01 OF-3 — connectivity is derived from what actually happened to requests,
 * not from `navigator.onLine`.
 *
 * `navigator.onLine` reports whether a link exists, not whether the API is
 * reachable: it is true behind a captive portal, true on a VPN that has
 * dropped, and true when the API's ingress is down. In an alarm-receiving
 * centre the difference between "the browser has a network" and "the operator's
 * completions are reaching the server" is the whole point.
 */
import { Store } from './observable.js';

export type ConnectivityStatus = 'online' | 'degraded' | 'offline';

export interface ConnectivityOptions {
  /** Consecutive transport failures before the status drops to offline. */
  failuresToOffline?: number;
  /** Consecutive failures before reporting degraded. */
  failuresToDegraded?: number;
}

export class Connectivity {
  readonly status = new Store<ConnectivityStatus>('online');
  private consecutiveFailures = 0;
  private streamOpen: boolean | null = null;
  private readonly toOffline: number;
  private readonly toDegraded: number;

  constructor(options: ConnectivityOptions = {}) {
    this.toDegraded = options.failuresToDegraded ?? 1;
    this.toOffline = options.failuresToOffline ?? 3;
  }

  get isOnline(): boolean {
    return this.status.get() === 'online';
  }

  get isOffline(): boolean {
    return this.status.get() === 'offline';
  }

  /** A response arrived — even a 500. The server is reachable. */
  reportSuccess(): void {
    this.consecutiveFailures = 0;
    this.recompute();
  }

  /** No response at all: DNS, TLS, reset, CORS. */
  reportTransportFailure(): void {
    this.consecutiveFailures += 1;
    this.recompute();
  }

  /**
   * The realtime stream's own view. A stream that will not stay open while
   * requests succeed is the signature of a proxy dropping long-lived
   * connections, which is degraded rather than offline.
   */
  reportStream(open: boolean): void {
    this.streamOpen = open;
    // A stream that opened is proof the server answered, so it clears the
    // failure run the same way a successful request does. Without this, a
    // client that went offline and whose only recovery signal is the stream
    // reconnecting would stay marked offline — and §01 OF-2 refuses writes
    // while offline, so it would stay unable to act.
    if (open) this.consecutiveFailures = 0;
    this.recompute();
  }

  private recompute(): void {
    if (this.consecutiveFailures >= this.toOffline) {
      this.status.set('offline');
      return;
    }
    if (this.consecutiveFailures >= this.toDegraded || this.streamOpen === false) {
      this.status.set('degraded');
      return;
    }
    this.status.set('online');
  }
}
