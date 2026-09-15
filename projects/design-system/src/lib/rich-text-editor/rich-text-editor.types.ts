/**
 * DSYS-10 -- which of the editor's toggleable marks/blocks are active at the current selection,
 * driven straight off Tiptap's own `editor.isActive(...)` on every transaction. Purely an
 * internal view-state shape (never re-exported as part of the underlying library's own API,
 * consistent with this package's thin-wrapper posture for third-party libraries -- see
 * chart.types.ts / design-decisions.md's ECharts decision for the precedent).
 */
export interface RichTextEditorActiveState {
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
  readonly strike: boolean;
  readonly bulletList: boolean;
  readonly orderedList: boolean;
  readonly blockquote: boolean;
  readonly code: boolean;
  readonly link: boolean;
}

export const RICH_TEXT_EDITOR_INACTIVE_STATE: RichTextEditorActiveState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  code: false,
  link: false,
};
