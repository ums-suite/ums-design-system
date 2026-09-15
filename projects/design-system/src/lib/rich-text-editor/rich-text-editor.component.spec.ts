import { TestBed } from '@angular/core/testing';
import type { WritableSignal } from '@angular/core';
import { UmsRichTextEditorComponent } from './rich-text-editor.component';
import {
  RICH_TEXT_EDITOR_INACTIVE_STATE,
  type RichTextEditorActiveState,
} from './rich-text-editor.types';

/**
 * Mirrors charts/line-chart.component.spec.ts's testing split (see that file's own comment):
 * this component's real lifecycle -- `afterNextRender` -> a dynamic `import('./tiptap-setup')`
 * -> constructing a real Tiptap `Editor` against a live DOM node -- is exactly the class of
 * real-browser, real-timing async behavior that spec documents as unreliable to await inside
 * Karma/Jasmine's zone-based flushing, so `fixture.detectChanges()` is deliberately never called
 * here. That lifecycle -- and the toolbar's actual keyboard operability, ARIA behavior, and
 * visual regression -- is instead covered against a real Playwright-driven Chromium in
 * e2e/rich-text-editor.spec.ts. What's verified here is this component's synchronous,
 * editor-independent logic: its default view state, and the guard clauses (`this.editor?.`) that
 * keep every toolbar command a safe no-op before the async editor has finished initializing.
 */
interface InternalsUnderTest {
  readonly activeState: WritableSignal<RichTextEditorActiveState>;
  readonly canUndo: WritableSignal<boolean>;
  readonly canRedo: WritableSignal<boolean>;
  readonly linkInputOpen: WritableSignal<boolean>;
  readonly linkUrlDraft: WritableSignal<string>;
  readonly linkInputId: string;
  toggleBold(): void;
  toggleItalic(): void;
  toggleUnderline(): void;
  toggleStrike(): void;
  toggleBulletList(): void;
  toggleOrderedList(): void;
  toggleBlockquote(): void;
  toggleCode(): void;
  undo(): void;
  redo(): void;
  onLinkButtonClick(): void;
  confirmLink(): void;
  cancelLink(): void;
}

describe('UmsRichTextEditorComponent', () => {
  function create(): InternalsUnderTest {
    return TestBed.createComponent(UmsRichTextEditorComponent)
      .componentInstance as unknown as InternalsUnderTest;
  }

  it('starts with every mark/list/link reported inactive and undo/redo unavailable', () => {
    const rte = create();
    expect(rte.activeState()).toEqual(RICH_TEXT_EDITOR_INACTIVE_STATE);
    expect(rte.canUndo()).toBeFalse();
    expect(rte.canRedo()).toBeFalse();
    expect(rte.linkInputOpen()).toBeFalse();
  });

  it('treats every toolbar formatting command as a safe no-op before the async editor initializes', () => {
    const rte = create();
    expect(() => rte.toggleBold()).not.toThrow();
    expect(() => rte.toggleItalic()).not.toThrow();
    expect(() => rte.toggleUnderline()).not.toThrow();
    expect(() => rte.toggleStrike()).not.toThrow();
    expect(() => rte.toggleBulletList()).not.toThrow();
    expect(() => rte.toggleOrderedList()).not.toThrow();
    expect(() => rte.toggleBlockquote()).not.toThrow();
    expect(() => rte.toggleCode()).not.toThrow();
    expect(() => rte.undo()).not.toThrow();
    expect(() => rte.redo()).not.toThrow();
  });

  it('opens the inline link-url prompt (never touching the editor) when no link is active', () => {
    const rte = create();
    rte.linkUrlDraft.set('stale-value-from-a-previous-open');

    rte.onLinkButtonClick();

    expect(rte.linkInputOpen()).toBeTrue();
    expect(rte.linkUrlDraft()).toBe('');
  });

  it('closes the link prompt on Cancel without throwing when there is no editor yet', () => {
    const rte = create();
    rte.linkInputOpen.set(true);

    expect(() => rte.cancelLink()).not.toThrow();
    expect(rte.linkInputOpen()).toBeFalse();
  });

  it('closes the link prompt on Apply without throwing when there is no editor yet', () => {
    const rte = create();
    rte.linkInputOpen.set(true);
    rte.linkUrlDraft.set('https://example.com');

    expect(() => rte.confirmLink()).not.toThrow();
    expect(rte.linkInputOpen()).toBeFalse();
  });

  it('gives every instance its own link-url label id, so multiple editors on one page never collide', () => {
    const first = create();
    const second = create();
    expect(first.linkInputId).not.toBe(second.linkInputId);
  });
});
