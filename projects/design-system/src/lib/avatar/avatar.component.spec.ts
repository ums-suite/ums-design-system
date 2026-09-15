import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsAvatarComponent } from './avatar.component';

@Component({
  standalone: true,
  imports: [UmsAvatarComponent],
  template: `
    <ums-avatar name="Fahim Rahman" data-testid="avatar-initials" />
    <ums-avatar
      name="Nusrat Jahan"
      imageUrl="https://example.test/avatar.jpg"
      data-testid="avatar-image"
    />
    <ums-avatar data-testid="avatar-fallback" />
  `,
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- pure template host, no state needed
class HostComponent {}

describe('UmsAvatarComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function avatar(testId: string) {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  it('derives up to two initials from the name when no image is given', () => {
    expect(avatar('avatar-initials').nativeElement.textContent.trim()).toBe('FR');
  });

  it('sets aria-label/role=img from the name for a screen-reader-accessible identity', () => {
    const el = avatar('avatar-initials').nativeElement as HTMLElement;
    expect(el.getAttribute('aria-label')).toBe('Fahim Rahman');
    expect(el.getAttribute('role')).toBe('img');
  });

  it('renders a decorative image (alt="") when imageUrl is given', () => {
    const img = avatar('avatar-image').query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.alt).toBe('');
    expect(img.src).toContain('avatar.jpg');
  });

  it('falls back to a generic person icon with neither name nor image', () => {
    expect(avatar('avatar-fallback').query(By.css('ums-icon'))).toBeTruthy();
    expect(avatar('avatar-fallback').nativeElement.getAttribute('aria-label')).toBeNull();
  });
});
