export type ConfirmTier = 1 | 2 | 3

export interface SideEffect {
  type: string
  description: string
  count?: number
}

export interface ConfirmDialogOptions {
  title: string
  message?: string
  tier: ConfirmTier
  subjectName?: string
  sideEffects?: SideEffect[]
  typeToConfirmValue?: string
  typeToConfirmLabel?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

export interface ConfirmState extends ConfirmDialogOptions {
  isOpen: boolean
  resolve?: (value: boolean) => void
}
