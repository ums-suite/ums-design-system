import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';
import type { TooltipPosition } from './tooltip.types';

let nextTooltipId = 0;

/**
 * DSYS-15 Tooltip. A directive, not a component -- `[umsTooltip]="'Some text'"` attaches to any
 * existing host element (a button, an icon, a truncated table cell) without wrapping it in extra
 * markup. Shows on hover AND focus (never hover-only, so a keyboard-only user gets the same
 * information), hides on mouseleave/blur/Escape. `aria-describedby` links the host to the
 * tooltip's id while it's visible, so a screen reader announces it as supplementary description,
 * not a separate, unrelated element -- the tooltip element itself is appended to `document.body`
 * (positioned via a live `getBoundingClientRect()` read, not a cached one) so it is never clipped
 * by an ancestor's `overflow: hidden`, a common problem for tooltips rendered in-place.
 */
@Directive({
  selector: '[umsTooltip]',
  standalone: true,
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class UmsTooltipDirective implements OnDestroy {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly id = `ums-tooltip-${++nextTooltipId}`;
  private tooltipEl: HTMLElement | null = null;

  readonly text = input.required<string>({ alias: 'umsTooltip' });
  readonly position = input<TooltipPosition>('top', { alias: 'umsTooltipPosition' });

  protected show(): void {
    if (this.tooltipEl || !this.text()) return;

    const tooltip = this.document.createElement('div');
    tooltip.className = 'ums-tooltip';
    tooltip.id = this.id;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = this.text();
    this.document.body.appendChild(tooltip);
    this.tooltipEl = tooltip;
    this.positionTooltip(tooltip);
    this.elementRef.nativeElement.setAttribute('aria-describedby', this.id);
  }

  protected hide(): void {
    this.tooltipEl?.remove();
    this.tooltipEl = null;
    this.elementRef.nativeElement.removeAttribute('aria-describedby');
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private positionTooltip(tooltip: HTMLElement): void {
    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const gap = 8;
    let top = hostRect.top;
    let left = hostRect.left;
    let transform = 'translate(0, 0)';

    switch (this.position()) {
      case 'top':
        top = hostRect.top - gap;
        left = hostRect.left + hostRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = hostRect.bottom + gap;
        left = hostRect.left + hostRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'start':
        top = hostRect.top + hostRect.height / 2;
        left = hostRect.left - gap;
        transform = 'translate(-100%, -50%)';
        break;
      case 'end':
        top = hostRect.top + hostRect.height / 2;
        left = hostRect.right + gap;
        transform = 'translate(0, -50%)';
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = transform;
  }
}
