import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UmsAssetComponent } from './asset.component';
import { ASSET_REGISTRY, type AssetName } from './asset-registry';

// See button.component.spec.ts's top comment: host bindings are signals so a later
// fixture.detectChanges() correctly re-propagates into this OnPush child under zoneless CD.
@Component({
  standalone: true,
  imports: [UmsAssetComponent],
  template: `<ums-asset [name]="name()" [decorative]="decorative()" />`,
})
class HostComponent {
  readonly name = signal<AssetName>('logo-mark');
  readonly decorative = signal(false);
}

describe('UmsAssetComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function svg(): SVGSVGElement {
    return fixture.debugElement.query(By.css('svg')).nativeElement as SVGSVGElement;
  }

  it('renders every registered asset slot without throwing', () => {
    for (const name of Object.keys(ASSET_REGISTRY) as AssetName[]) {
      host.name.set(name);
      expect(() => fixture.detectChanges()).not.toThrow();
    }
  });

  it('exposes a real accessible description by default', () => {
    expect(svg().getAttribute('role')).toBe('img');
    expect(svg().getAttribute('aria-label')).toBe(ASSET_REGISTRY['logo-mark'].description);
  });

  it('hides the asset from the accessibility tree when decorative', () => {
    host.decorative.set(true);
    fixture.detectChanges();
    expect(svg().getAttribute('aria-hidden')).toBe('true');
  });

  it("every placeholder asset's markup is visibly labelled as a placeholder", () => {
    for (const definition of Object.values(ASSET_REGISTRY)) {
      expect(definition.markup).toContain('PLACEHOLDER');
    }
  });
});
