import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { UmsButtonComponent } from '../button/button.component';
import { UmsIconButtonComponent } from '../icon-button/icon-button.component';
import { UmsInputComponent } from '../input/input.component';
import {
  RICH_TEXT_EDITOR_INACTIVE_STATE,
  type RichTextEditorActiveState,
} from './rich-text-editor.types';

let nextRichTextEditorId = 0;

/**
 * DSYS-10 Rich text editor (requirement-spec.md §6 "Forms & Inputs": "Rich text editor, for
 * Notice/Content authoring"). Wraps Tiptap/ProseMirror (design-decisions.md-equivalent rationale
 * below) exactly as thinly as this package wraps ECharts for DSYS-16: consumers get
 * `[value]`/`(valueChange)` HTML content and a fixed toolbar, never Tiptap's own `Editor`
 * instance, its command-chaining API, or its extension types.
 *
 * **Library choice: Tiptap (`@tiptap/core` + `@tiptap/starter-kit` + `@tiptap/extension-placeholder`)**,
 * see the PR description for the full options-considered writeup mirroring design-decisions.md's
 * "Charting Engine Selection" format. Summary: Tiptap is framework-agnostic (a plain `Editor`
 * class you mount into any DOM element -- no official Angular package needed, the same posture
 * this file takes for base-chart.ts/ECharts), is the most actively-maintained headless rich-text
 * engine available, and its StarterKit bundle already covers this ticket's entire toolbar surface
 * (bold/italic/underline/strike, lists, blockquote, inline code, link, undo/redo) in one package,
 * so no extra extension package is needed beyond Placeholder for the empty-state hint.
 *
 * Conventions this component follows, copied from DSYS-8's own primitives (input.component.ts,
 * textarea.component.ts) rather than Angular's `ControlValueAccessor`:
 *  - `[value]`/`(valueChange)` two-way signal binding (HTML string), usable as `[(value)]`.
 *  - `[id]`/`[ariaDescribedBy]` inputs a `ums-form-field` wires up via its `controlId()`/
 *    `describedBy()` template-reference API, exactly like `<ums-input>`.
 *  - `[invalid]` toggles a host class for the same border-color treatment DSYS-8's other
 *    controls use, so a Rich Text Editor inside an invalid `ums-form-field` reads consistently.
 *
 * Theming: unlike DSYS-16's chart family, Tiptap/ProseMirror renders real DOM (paragraphs, marks,
 * lists), not a canvas -- so it needs none of base-chart.ts's mandatory live-color-re-resolution
 * mechanism (design-decisions.md "Theme-Switch Transition Mechanism"); the CSS cascade over this
 * component's own token-driven styles already repaints it correctly on every theme change, the
 * same as any other DOM-based component. `prefers-reduced-motion` is likewise already covered by
 * `MotionService`'s platform-wide `Document.getAnimations()` mechanism; this component defines no
 * animation of its own.
 *
 * Tiptap's own default behavior this component deliberately overrides:
 *  - `injectCSS: false` -- by default Tiptap injects its own global `<style>` tag (structural
 *    ProseMirror rules, e.g. gap-cursor caret visibility) into `<head>`, entirely outside this
 *    package's token system. This component ships the token-driven equivalent itself in
 *    rich-text-editor.component.scss instead, so nothing the editor paints ever bypasses
 *    `var(--...)` tokens -- the same bar as every other component in this package.
 *  - The editable root's id/aria-* attributes and CSS class are supplied via `editorProps`, kept
 *    in sync with this component's own signal inputs by a dedicated `effect()` (Tiptap has no
 *    signal/reactive-input concept of its own to bind to directly).
 */
@Component({
  selector: 'ums-rich-text-editor',
  standalone: true,
  imports: [UmsIconButtonComponent, UmsButtonComponent, UmsInputComponent],
  templateUrl: './rich-text-editor.component.html',
  styleUrl: './rich-text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // See class doc: Tiptap/ProseMirror creates its editable DOM node imperatively (outside
  // Angular's renderer), so Angular's emulated encapsulation attribute never lands on it --
  // scoped selectors could never reach it. Every selector in the stylesheet is hand-scoped under
  // the unique `.ums-rich-text-editor*` prefix instead, so nothing here leaks globally.
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'ums-rich-text-editor',
    '[class.ums-rich-text-editor--invalid]': 'invalid()',
    '[class.ums-rich-text-editor--disabled]': 'disabled()',
  },
})
export class UmsRichTextEditorComponent {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** Id for the (conditionally-rendered) link-URL input's own hidden `<label>`. */
  protected readonly linkInputId = `ums-rich-text-editor-link-${++nextRichTextEditorId}`;

  readonly value = input<string>('');
  readonly placeholder = input<string | undefined>(undefined);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  /**
   * A visible `<label for>` alone does NOT give this editor's real interactive element an
   * accessible name -- unlike `<ums-input>`, that element is a `role="textbox"` `<div
   * contenteditable>`, and `<label for>` only computes an accessible name automatically for
   * "labelable" elements (button/input/select/textarea/...) per the HTML forms spec. Bind this to
   * `ums-form-field`'s `labelId()` (never leave both this and `ariaLabel` unset when wrapped in a
   * visible label) so requirement-spec.md §8's automated a11y gate stays satisfied.
   */
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);

  readonly valueChange = output<string>();
  readonly blurred = output();

  protected readonly editorRoot = viewChild.required<ElementRef<HTMLDivElement>>('editorRoot');
  /** Only present once `linkInputOpen()` is true (it's behind an `@if` in the template). */
  // `read: ElementRef` is required here -- `#linkUrlInput` sits on a `<ums-input>` element, and an
  // unqualified template reference on a component-hosting element resolves to that *component
  // instance* by default, not its native element.
  protected readonly linkUrlInput = viewChild('linkUrlInput', { read: ElementRef });

  protected readonly activeState = signal<RichTextEditorActiveState>(
    RICH_TEXT_EDITOR_INACTIVE_STATE,
  );
  protected readonly canUndo = signal(false);
  protected readonly canRedo = signal(false);
  protected readonly linkInputOpen = signal(false);
  protected readonly linkUrlDraft = signal('');

  private editor: TiptapEditor | undefined;
  /** Guards against re-emitting `valueChange` while applying an externally-set `[value]`. */
  private applyingExternalValue = false;

  constructor() {
    afterNextRender(() => void this.initEditor());
    this.destroyRef.onDestroy(() => this.editor?.destroy());
  }

  private async initEditor(): Promise<void> {
    const { Editor, Placeholder, StarterKit } = await import('./tiptap-setup');

    this.editor = new Editor({
      element: this.editorRoot().nativeElement,
      injectCSS: false,
      extensions: [
        StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
        // Read once at construction, like `content` below -- a `[placeholder]` change after the
        // editor exists (rare in practice: hint text, not user data) isn't re-applied. Fully
        // reactive would mean reconfiguring the extension manager on every change; not worth the
        // complexity for a hint string, matching this component's overall thin-wrapper posture.
        Placeholder.configure({ placeholder: this.placeholder() ?? '' }),
      ],
      content: this.value(),
      editable: this.isEditable(),
      editorProps: { attributes: this.buildInitialEditorAttributes() },
      onUpdate: ({ editor }) => {
        this.applyingExternalValue = true;
        this.valueChange.emit(editor.getHTML());
        this.applyingExternalValue = false;
      },
      onSelectionUpdate: () => this.syncViewState(),
      onTransaction: () => this.syncViewState(),
      onBlur: () => this.blurred.emit(),
    });

    this.syncViewState();

    // `[value]` set from outside (e.g. a form reset, or loading a saved draft) -- push it into
    // the editor without re-emitting `valueChange` (see `applyingExternalValue`).
    effect(
      () => {
        const html = this.value();
        if (!this.editor || this.applyingExternalValue) return;
        if (html === this.editor.getHTML()) return;
        this.editor.commands.setContent(html, { emitUpdate: false });
      },
      { injector: this.injector },
    );

    effect(
      () => {
        this.editor?.setEditable(this.isEditable());
      },
      { injector: this.injector },
    );

    // id/aria-*/placeholder can all change after init (e.g. a `ums-form-field`'s computed
    // `describedBy()` flipping once a validation error appears) -- Tiptap has no reactive-input
    // concept of its own, so this re-applies them by hand whenever any of these signals change.
    effect(
      () => {
        if (!this.editor) return;
        const attrs = this.buildEditorAttributes();
        for (const [name, attrValue] of Object.entries(attrs)) {
          if (attrValue === null) {
            this.editor.view.dom.removeAttribute(name);
          } else {
            this.editor.view.dom.setAttribute(name, attrValue);
          }
        }
      },
      { injector: this.injector },
    );
  }

  private isEditable(): boolean {
    return !this.disabled() && !this.readonly();
  }

  /** Tiptap's own `editorProps.attributes` type has no notion of "absent" -- filter nulls out. */
  private buildInitialEditorAttributes(): Record<string, string> {
    const attrs: Record<string, string> = {};
    for (const [name, value] of Object.entries(this.buildEditorAttributes())) {
      if (value !== null) attrs[name] = value;
    }
    return attrs;
  }

  private buildEditorAttributes(): Record<string, string | null> {
    return {
      class: 'ums-rich-text-editor__prosemirror',
      id: this.id() ?? null,
      role: 'textbox',
      'aria-multiline': 'true',
      'aria-label': this.ariaLabel() ?? null,
      'aria-labelledby': this.ariaLabelledBy() ?? null,
      'aria-describedby': this.ariaDescribedBy() ?? null,
      'aria-invalid': this.invalid() ? 'true' : null,
      'aria-required': this.required() ? 'true' : null,
    };
  }

  private syncViewState(): void {
    const editor = this.editor;
    if (!editor) return;
    this.activeState.set({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      strike: editor.isActive('strike'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      code: editor.isActive('code'),
      link: editor.isActive('link'),
    });
    this.canUndo.set(editor.can().undo());
    this.canRedo.set(editor.can().redo());
  }

  protected toggleBold(): void {
    this.editor?.chain().focus().toggleBold().run();
  }

  protected toggleItalic(): void {
    this.editor?.chain().focus().toggleItalic().run();
  }

  protected toggleUnderline(): void {
    this.editor?.chain().focus().toggleUnderline().run();
  }

  protected toggleStrike(): void {
    this.editor?.chain().focus().toggleStrike().run();
  }

  protected toggleBulletList(): void {
    this.editor?.chain().focus().toggleBulletList().run();
  }

  protected toggleOrderedList(): void {
    this.editor?.chain().focus().toggleOrderedList().run();
  }

  protected toggleBlockquote(): void {
    this.editor?.chain().focus().toggleBlockquote().run();
  }

  protected toggleCode(): void {
    this.editor?.chain().focus().toggleCode().run();
  }

  protected undo(): void {
    this.editor?.chain().focus().undo().run();
  }

  protected redo(): void {
    this.editor?.chain().focus().redo().run();
  }

  /** Link toolbar button: removes an active link immediately, otherwise opens the URL prompt. */
  protected onLinkButtonClick(): void {
    if (this.activeState().link) {
      this.editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    this.linkUrlDraft.set('');
    this.linkInputOpen.set(true);
    // The URL input is behind an `@if` -- it doesn't exist in the DOM yet on this same tick.
    // Keyboard operability (the ticket's explicit mandate) means a keyboard-only author should
    // land straight in the field they need next, the same `afterNextRender`-after-the-next-
    // render-commit pattern date-picker.component.ts uses for its own post-open focus move.
    afterNextRender(() => this.focusLinkUrlInput(), { injector: this.injector });
  }

  private focusLinkUrlInput(): void {
    this.linkUrlInput()?.nativeElement.querySelector('input')?.focus();
  }

  protected confirmLink(): void {
    const url = this.linkUrlDraft().trim();
    if (url) {
      this.editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      this.editor?.chain().focus().run();
    }
    this.linkInputOpen.set(false);
  }

  protected cancelLink(): void {
    this.linkInputOpen.set(false);
    this.editor?.chain().focus().run();
  }
}
