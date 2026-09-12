import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsBreadcrumbsComponent } from './breadcrumbs.component';
import type { BreadcrumbItem } from './breadcrumbs.types';

@Component({
  standalone: true,
  imports: [UmsBreadcrumbsComponent],
  template: `<ums-breadcrumbs [items]="items" (itemClick)="clicked = $event" />`,
})
class HostComponent {
  readonly items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Students', href: '/students' },
    { label: 'Fahim Rahman' },
  ];
  clicked: BreadcrumbItem | undefined;
}

describe('UmsBreadcrumbsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a nav with an accessible "Breadcrumb" label and an ordered list', () => {
    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav.attributes['aria-label']).toBe('Breadcrumb');
    expect(fixture.debugElement.query(By.css('ol'))).toBeTruthy();
  });

  it('renders every non-final item as a link', () => {
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(2);
    expect(links[0].nativeElement.textContent.trim()).toBe('Dashboard');
  });

  it('renders the final item as the current page, not a link', () => {
    const current = fixture.debugElement.query(By.css('[aria-current="page"]'));
    expect(current.nativeElement.tagName).toBe('SPAN');
    expect(current.nativeElement.textContent.trim()).toBe('Fahim Rahman');
  });

  it('emits itemClick with the clicked crumb, without a full navigation', () => {
    const firstLink = fixture.debugElement.query(By.css('a')).nativeElement as HTMLAnchorElement;
    firstLink.click();
    fixture.detectChanges();
    expect(host.clicked).toEqual({ label: 'Dashboard', href: '/dashboard' });
  });
});
