export type LocalizationDictionary = Record<string, string>

export interface LocalizationBundle {
  culture: string
  values: LocalizationDictionary
}

export type I18nParams = Record<string, string | number | boolean | null | undefined>

export interface I18nState {
  currentCulture: string
  defaultCulture: string
  bundles: Record<string, LocalizationDictionary>
  missingKeys: string[]
  isLoading: boolean
}
