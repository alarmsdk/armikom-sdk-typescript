/**
 * The domain layer behind operator advisories.
 *
 * An advisory is one AI run for the signal event an operator is working. Under it are
 * *notes*, and each note is bound to a **hook** — one of the operator's own actions, like
 * dialling a contact or completing the alarm — and an **effect**, which says how loudly the
 * console should say it.
 *
 * The asymmetry between those two is the whole design. Hooks are an open set: a new customer
 * scenario adds a prompt and a rule row, and the only console change is a `guard.check()` call
 * wherever that action lives. Effects are closed, because each one has a renderer here. A note
 * carrying an effect this build does not know is shown as `inform` rather than dropped — the
 * observation may be right and only the volume wrong.
 *
 * **Nothing here can stop an operator.** There is deliberately no effect that blocks an
 * action. The strongest, `require-reason`, asks them to record why they are proceeding, and
 * then they proceed. In a monitoring centre the cost of a wrong warning is a call that does
 * not happen, and that has to stay impossible.
 *
 * Pure functions only — no Vue, no client.
 */

/** The operator actions a note can attach to. Open set: the server is the authority. */
export const HOOKS = {
  alarmOpen: 'alarm.open',
  callContact: 'call.contact',
  callDealer: 'call.dealer',
  callEmergency: 'call.emergency',
  smsSend: 'sms.send',
  alarmDelay: 'alarm.delay',
  alarmHandover: 'alarm.handover',
  alarmComplete: 'alarm.complete'
} as const

export type Hook = (typeof HOOKS)[keyof typeof HOOKS] | (string & {})

/**
 * What the console does with a note. Closed set, weakest first — the order is the severity
 * ramp, and `strongestEffect` relies on it.
 */
export const EFFECTS = ['inform', 'suggest', 'warn', 'confirm', 'require-reason'] as const

export type Effect = (typeof EFFECTS)[number]

export interface AdvisoryNote {
  id: string
  hook?: string | null
  effect?: string | null
  severity: number
  title?: string | null
  message?: string | null
  /** The single row this is about, as `kind:id`. Null means every target of the hook. */
  targetRef?: string | null
  /** Which records the note was drawn from, as JSON. Shown so the reading can be checked. */
  evidence?: string | null
}

export type AdvisoryStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped'

export interface Advisory {
  id: string
  status: AdvisoryStatus | (string & {})
  summary?: string | null
  relationName?: string | null
  requestedAt?: string | null
  completedAt?: string | null
  skipReason?: string | null
  notes: AdvisoryNote[]
}

/** An advisory that has not finished yet. The console waits briefly on these — see the guard. */
export function isOutstanding(advisory: Advisory): boolean {
  return advisory.status === 'pending' || advisory.status === 'running'
}

/** True when any advisory for this alarm is still being produced. */
export function hasOutstanding(advisories: Advisory[]): boolean {
  return advisories.some(isOutstanding)
}

/** Reads an unknown effect as `inform`: quieter is the safe direction to be wrong in. */
export function normaliseEffect(effect?: string | null): Effect {
  const found = EFFECTS.find((e) => e === effect?.toLowerCase())
  return found ?? 'inform'
}

/**
 * True when the effect stands between the operator and the action.
 *
 * This is the one place that decides it. The guard's wait, the dialog and the button badge all
 * read this, so they cannot disagree about whether a note is worth pausing for.
 */
export function interrupts(effect?: string | null): boolean {
  const e = normaliseEffect(effect)
  return e === 'confirm' || e === 'require-reason'
}

/** True when the operator must type a reason before the action runs. */
export function requiresReason(effect?: string | null): boolean {
  return normaliseEffect(effect) === 'require-reason'
}

/**
 * The notes that apply to one action.
 *
 * Matching is one rule: the hook is the same, and either the note names no target or it names
 * this one. That is what keeps "this person does not want to be called" on one row of the
 * contacts panel instead of on all three.
 */
export function notesFor(
  advisories: Advisory[],
  hook: Hook,
  targetRef?: string | null
): AdvisoryNote[] {
  const matched = advisories
    .flatMap((a) => a.notes)
    .filter((n) => n.hook?.toLowerCase() === hook.toLowerCase())
    .filter((n) => !n.targetRef || (!!targetRef && n.targetRef === targetRef))

  return sortNotes(matched)
}

/** Every note, for the panel. Same ordering as a dialog, so the two read alike. */
export function allNotes(advisories: Advisory[]): AdvisoryNote[] {
  return sortNotes(advisories.flatMap((a) => a.notes))
}

/**
 * Strongest first, then by severity.
 *
 * A dialog shows several notes stacked and an operator reads the top one mid-call, so the one
 * that changes what they do has to be there.
 */
export function sortNotes(notes: AdvisoryNote[]): AdvisoryNote[] {
  return [...notes].sort((a, b) => {
    const byEffect = EFFECTS.indexOf(normaliseEffect(b.effect)) - EFFECTS.indexOf(normaliseEffect(a.effect))
    if (byEffect !== 0) return byEffect
    return (b.severity ?? 0) - (a.severity ?? 0)
  })
}

/** The effect that decides the interaction: the strongest among the matching notes. */
export function strongestEffect(notes: AdvisoryNote[]): Effect {
  return notes.reduce<Effect>((strongest, note) => {
    const effect = normaliseEffect(note.effect)
    return EFFECTS.indexOf(effect) > EFFECTS.indexOf(strongest) ? effect : strongest
  }, 'inform')
}

/** Builds the `kind:id` reference the server uses for a target. */
export function reference(kind: string, id?: string | null): string | undefined {
  return id ? `${kind}:${id}` : undefined
}

/**
 * Parses a note's evidence for display, or returns an empty list.
 *
 * Evidence is what lets an operator check a claim rather than take it on trust, so a note whose
 * evidence will not parse still shows — it just shows without its citations.
 */
export function parseEvidence(
  evidence?: string | null
): Array<{ kind?: string; id?: string; quote?: string }> {
  if (!evidence) return []
  try {
    const parsed = JSON.parse(evidence)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
