import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsTabBarComponent } from './tab-bar.component';
import type { TabBarItem } from './tab-bar.types';

@Component({
  standalone: true,
  imports: [UmsTabBarComponent],
  template: `
    <ums-tab-bar
      [items]="items"
      [selectedIndex]="selectedIndex()"
      (selectedIndexChange)="selectedIndex.set($event)"
    />
  `,
})
class HostComponent {
  readonly items: TabBarItem[] = [
    { label: 'Overview' },
    { label: 'Documents', disabled: true },
    { label: 'Payments' },
  ];
  readonly selectedIndex = signal(0);
}

describe('UmsTabBarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function tabs(): HTMLButtonElement[] {
    return fixture.debugElement.queryAll(By.css('[role="tab"]')).map((el) => el.nativeElement);
  }

  it('renders a tablist with only the selected tab in the Tab order', () => {
    const list = fixture.debugElement.query(By.css('[role="tablist"]'));
    expect(list).toBeTruthy();
    expect(tabs()[0].getAttribute('tabindex')).toBe('0');
    expect(tabs()[2].getAttribute('tabindex')).toBe('-1');
  });

  it('selects a tab on click', () => {
    tabs()[2].click();
    fixture.detectChanges();
    expect(host.selectedIndex()).toBe(2);
  });

  it('does not select a disabled tab on click', () => {
    tabs()[1].click();
    fixture.detectChanges();
    expect(host.selectedIndex()).toBe(0);
  });

  it('skips the disabled tab when moving with ArrowRight', () => {
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(host.selectedIndex()).toBe(2);
  });

  it('jumps to the last enabled tab on End', () => {
    tabs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(host.selectedIndex()).toBe(2);
  });
});
