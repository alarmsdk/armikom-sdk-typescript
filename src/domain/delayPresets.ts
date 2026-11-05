/**
 * Signal delay presets — the legacy "Mesajı Ertele" set — shared by the delay dialogs
 * (DelayPresetPicker) and the alarm row context menu. Durations are kept in minutes and
 * turned into the API's whole-number `{ delayTime, timeUnit }` only when sent.
 */
export const DELAY_PRESET_MINUTES = [5, 10, 15, 20, 30, 45]
export const DELAY_PRESET_HOURS = [60, 90, 120, 180, 240, 360, 480, 720]

export type DelayUnit = 'Minute' | 'Hour'

const LAST_KEY = 'armikom.signalDelay.lastPresetMinutes'

/** Whole hours go as hours; anything else (e.g. 1.5 h) as minutes. */
export function delayPresetRequest(minutes: number): { delayTime: number; timeUnit: DelayUnit } {
  return minutes % 60 === 0 ? { delayTime: minutes / 60, timeUnit: 'Hour' } : { delayTime: minutes, timeUnit: 'Minute' }
}

export function delayPresetLabel(t: (key: string, params?: Record<string, unknown>) => string, minutes: number) {
  if (minutes < 60) return t('UI.ALARM_WORKSPACE.DELAY_PRESET_MINUTES', { n: minutes })
  const hours = (minutes / 60).toLocaleString(undefined, { maximumFractionDigits: 1 })
  return t('UI.ALARM_WORKSPACE.DELAY_PRESET_HOURS', { n: hours })
}

/** Local clock time the signal comes back at. */
export function delayReturnTime(nowMs: number, minutes: number) {
  return new Date(nowMs + minutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Last preset this browser used (best effort — storage may be unavailable). */
export function lastDelayPreset(): number | null {
  try {
    const v = Number(localStorage.getItem(LAST_KEY))
    return v > 0 ? v : null
  } catch {
    return null
  }
}

export function rememberDelayPreset(minutes: number) {
  try { localStorage.setItem(LAST_KEY, String(minutes)) } catch { /* best effort */ }
}

/**
 * Minutes from now until the next local `HH:MM` (today, or tomorrow when that time has
 * already passed). Rounded up so the signal never comes back before the asked time.
 * Returns null for an empty or malformed value.
 */
export function minutesUntilClock(nowMs: number, hhmm: string): { minutes: number; tomorrow: boolean } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  const target = new Date(nowMs)
  target.setHours(h, min, 0, 0)
  let tomorrow = false
  if (target.getTime() <= nowMs) {
    target.setDate(target.getDate() + 1)
    tomorrow = true
  }
  return { minutes: Math.max(1, Math.ceil((target.getTime() - nowMs) / 60000)), tomorrow }
}
