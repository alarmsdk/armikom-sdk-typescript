/**
 * §01 §12 — the eight event names on `GET /v1/stream`, typed.
 *
 * The generic `EventStream` in `core/realtime.ts` does the connecting,
 * reconnecting, watchdog and resync; this file only says what the events are
 * called and which of them are nudges rather than payloads.
 */
import { EventStream, type StreamEvent } from '../core/realtime.js';
import type { Unsubscribe } from '../core/observable.js';

export const ArmikomEvents = {
  /** §01 S-2 / D23 — empty payload by design. A nudge to re-read `GetAlarmEvents`. */
  ALARM_LIST_UPDATED: 'alarm-list-updated',
  SIGNAL_EVENTS: 'signal-events',
  /** §01 S-4 — raw bus JSON; unknown fields are expected. */
  PBX_RINGING: 'pbx-ringing',
  SIDE_LOCK_CHANGED: 'side-lock-changed',
  SIDE_STATUS_CHANGED: 'side-status-changed',
  SIDE_APPROVAL_CHANGED: 'side-approval-changed',
  REFERENCE_BUNDLE_CHANGED: 'reference-bundle-changed',
  LOCALIZATION_BUNDLE_CHANGED: 'localization-bundle-changed',
} as const;

export type ArmikomEventName = (typeof ArmikomEvents)[keyof typeof ArmikomEvents];

/**
 * A thin typed facade. Every method returns an unsubscribe, so a screen's
 * teardown is a list of calls rather than a bookkeeping problem.
 */
export class ArmikomStream {
  constructor(readonly events: EventStream) {}

  get status() {
    return this.events.status;
  }

  start(): void {
    this.events.start();
  }

  stop(): void {
    this.events.stop();
  }

  dispose(): Promise<void> {
    return this.events.dispose();
  }

  /** §01 S-9 / C-19 — re-read your working set; the gap was not replayed. */
  onResync(listener: () => void): Unsubscribe {
    return this.events.onResync(listener);
  }

  /**
   * §01 S-3 / C-17 — one coalesced re-read per burst of alarm nudges, and one
   * on every reconnect.
   */
  onAlarmListChanged(reread: () => void, debounceMs = 300): Unsubscribe {
    return this.events.onNudge(ArmikomEvents.ALARM_LIST_UPDATED, reread, debounceMs);
  }

  onSignalEvents(listener: (event: StreamEvent) => void): Unsubscribe {
    return this.events.on(ArmikomEvents.SIGNAL_EVENTS, listener);
  }

  onPbxRinging(listener: (event: StreamEvent) => void): Unsubscribe {
    return this.events.on(ArmikomEvents.PBX_RINGING, listener);
  }

  onSideLockChanged(listener: (event: StreamEvent) => void): Unsubscribe {
    return this.events.on(ArmikomEvents.SIDE_LOCK_CHANGED, listener);
  }

  onSideStatusChanged(listener: (event: StreamEvent) => void): Unsubscribe {
    return this.events.on(ArmikomEvents.SIDE_STATUS_CHANGED, listener);
  }

  onSideApprovalChanged(listener: (event: StreamEvent) => void): Unsubscribe {
    return this.events.on(ArmikomEvents.SIDE_APPROVAL_CHANGED, listener);
  }

  onReferenceBundleChanged(listener: () => void): Unsubscribe {
    return this.events.on(ArmikomEvents.REFERENCE_BUNDLE_CHANGED, () => listener());
  }

  onLocalizationBundleChanged(listener: () => void): Unsubscribe {
    return this.events.on(ArmikomEvents.LOCALIZATION_BUNDLE_CHANGED, () => listener());
  }
}
