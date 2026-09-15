/**
 * DSYS-10 -- the one place this package imports from Tiptap. Mirrors charts/echarts-setup.ts's
 * role for ECharts: every consumer of Tiptap in this library imports it from here, never
 * `@tiptap/core`/`@tiptap/starter-kit` directly, so a future extension addition (a table, an
 * image node, ...) is a one-file change.
 *
 * Design decisions this package's rich-text-editor family commits to (see
 * rich-text-editor.component.ts's own class doc for the full rationale):
 *  - StarterKit bundles Bold/Italic/Underline/Strike, Bullet/Ordered list, Blockquote, inline
 *    Code, Link, History (undo/redo) -- exactly this component's toolbar surface, with no extra
 *    extension packages needed beyond Placeholder (empty-state hint text).
 *  - `link.openOnClick: false` -- a Notice/Content author needs to keep editing text under a
 *    link, not get navigated away by their own click while writing.
 */
export { Editor } from '@tiptap/core';
export { Placeholder } from '@tiptap/extension-placeholder';
export { StarterKit } from '@tiptap/starter-kit';
