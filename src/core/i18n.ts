/**
 * §01 §9 — localisation.
 *
 * Pulled up from the console's `I18nService`, which had the right shape already
 * (nested JSON dictionaries, `{{param}}` interpolation, fall back to English,
 * then to the key). What it lacked is LO-3: a missing key was silently replaced
 * by the key itself, which is exactly how the catalogues drifted to
 * tr 552 / en 531 / az 508 without anyone noticing (finding F15).
 *
 * Both catalogue shapes are supported, because the two services ship different
 * ones: Armikom.Api's `GetLocalizationBundle` returns a flat `UI.*` map, the
 * console ships nested JSON per language.
 */
import { Emitter, Store } from './observable.js';
import { toUpperCulture } from './text.js';

export type Dictionary = Record<string, unknown>;

export interface I18nOptions {
  culture: string;
  /** §01 LO-2 — the second link in the fallback chain. */
  defaultCulture?: string;
  bundles?: Record<string, Dictionary>;
  /** `{{name}}` by default; some catalogues use `{name}`. */
  interpolationPattern?: RegExp;
  onMissingKey?: (key: string, culture: string) => void;
}

export interface MissingKey {
  key: string;
  culture: string;
}

export class I18n {
  readonly culture: Store<string>;
  /** §01 LO-3 — missing keys are observable, not silent. */
  readonly missing = new Emitter<MissingKey>();

  private readonly bundles = new Map<string, Dictionary>();
  private readonly defaultCulture: string;
  private readonly pattern: RegExp;
  private readonly seenMissing = new Set<string>();

  constructor(options: I18nOptions) {
    this.culture = new Store(options.culture);
    this.defaultCulture = options.defaultCulture ?? 'tr';
    this.pattern = options.interpolationPattern ?? /\{\{\s*([\w.]+)\s*\}\}|\{\s*([\w.]+)\s*\}/g;
    for (const [culture, bundle] of Object.entries(options.bundles ?? {})) this.bundles.set(culture, bundle);
    if (options.onMissingKey) this.missing.on(({ key, culture }) => options.onMissingKey?.(key, culture));
    this.t = this.t.bind(this);
  }

  setBundle(culture: string, bundle: Dictionary): void {
    this.bundles.set(culture, bundle);
    // A key that was missing before this bundle arrived deserves to be
    // reported again if it is still missing after it.
    this.seenMissing.clear();
    if (culture === this.culture.get()) this.culture.set(culture);
  }

  hasBundle(culture: string): boolean {
    return this.bundles.has(culture);
  }

  setCulture(culture: string): void {
    this.culture.set(culture);
  }

  /** The keys the app asked for and did not get, deduplicated. */
  get missingKeys(): readonly string[] {
    return [...this.seenMissing];
  }

  /** §01 LO-2 — requested culture → default culture → the key itself. */
  t(key: string, params?: Record<string, unknown>): string {
    if (!key) return '';
    const culture = this.culture.get();
    const resolved =
      resolve(this.bundles.get(culture), key) ?? resolve(this.bundles.get(this.defaultCulture), key) ?? null;

    if (resolved === null) {
      const marker = `${culture}::${key}`;
      if (!this.seenMissing.has(marker)) {
        this.seenMissing.add(marker);
        this.missing.emit({ key, culture });
      }
      return this.interpolate(key, params);
    }
    return this.interpolate(resolved, params);
  }

  /** True when a key resolves in the requested culture *or* the fallback. */
  has(key: string): boolean {
    return (
      resolve(this.bundles.get(this.culture.get()), key) !== null ||
      resolve(this.bundles.get(this.defaultCulture), key) !== null
    );
  }

  /** §01 C-14 — culture-aware upper-casing, bound to the active culture. */
  upper(value: string): string {
    return toUpperCulture(value, this.culture.get());
  }

  private interpolate(template: string, params?: Record<string, unknown>): string {
    if (!params) return template;
    return template.replace(this.pattern, (match, a: string | undefined, b: string | undefined) => {
      const name = a ?? b;
      if (!name) return match;
      const value = params[name];
      return value === undefined || value === null ? match : String(value);
    });
  }
}

/**
 * Resolves both catalogue shapes: a flat key (`"UI.Alarm.Title"` as a literal
 * property) and a nested path (`{ UI: { Alarm: { Title } } }`). Flat wins,
 * because Armikom.Api's bundle genuinely contains dots in its keys.
 */
function resolve(bundle: Dictionary | undefined, key: string): string | null {
  if (!bundle) return null;
  const direct = bundle[key];
  if (typeof direct === 'string') return direct;

  let current: unknown = bundle;
  for (const part of key.split('.')) {
    if (!current || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : null;
}
