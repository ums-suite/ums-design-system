import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsErrorStateComponent } from './error-state.component';

@Component({
  standalone: true,
  imports: [UmsErrorStateComponent],
  template: `
    <ums-error-state
      title="Couldn't load the results"
      description="Something went wrong while fetching this page."
      (retry)="retryCount = retryCount + 1"
    />
  `,
})
class HostComponent {
  retryCount = 0;
}

describe('UmsErrorStateComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the title and description', () => {
    const el = fixture.debugElement.query(By.css('ums-error-state')).nativeElement as HTMLElement;
    expect(el.textContent).toContain("Couldn't load the results");
    expect(el.textContent).toContain('Something went wrong while fetching this page.');
  });

  it('emits retry when the retry button is clicked', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    button.click();
    expect(host.retryCount).toBe(1);
  });
});
