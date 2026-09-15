import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsAvatarGroupComponent } from './avatar-group.component';
import type { AvatarGroupMember } from './avatar-group.types';

@Component({
  standalone: true,
  imports: [UmsAvatarGroupComponent],
  template: `<ums-avatar-group [members]="members" [max]="3" />`,
})
class HostComponent {
  readonly members: AvatarGroupMember[] = [
    { name: 'Fahim Rahman' },
    { name: 'Nusrat Jahan' },
    { name: 'Tanvir Ahmed' },
    { name: 'Kamrul Islam' },
    { name: 'Sadia Akter' },
  ];
}

describe('UmsAvatarGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders only the first `max` avatars', () => {
    expect(fixture.debugElement.queryAll(By.css('ums-avatar')).length).toBe(3);
  });

  it('renders a +N overflow badge naming the hidden members', () => {
    const overflow = fixture.debugElement.query(By.css('.ums-avatar-group__overflow'));
    expect(overflow.nativeElement.textContent.trim()).toBe('+2');
    expect(overflow.nativeElement.getAttribute('aria-label')).toContain('Kamrul Islam');
    expect(overflow.nativeElement.getAttribute('aria-label')).toContain('Sadia Akter');
  });
});
