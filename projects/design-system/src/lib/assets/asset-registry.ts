/**
 * DSYS-6 asset registry (requirement-spec.md §6, "Asset registry" paragraph): "logo, logo-mark,
 * and a shared illustration set... are versioned alongside the component library as Assets.*, so
 * no consuming app inlines an ad hoc illustration or forks the brand mark locally."
 *
 * Hand-authored, not codegen -- unlike the icon registry (a curated slice of an existing third-
 * party icon set), these five slots are this package's own brand assets and have no upstream
 * source to generate from.
 *
 * IMPORTANT: every markup value below is a clearly-labelled PLACEHOLDER, not real brand art. This
 * pass builds the real registry mechanism (typed slot names, one place every consuming app reads
 * logo/illustration markup from, a component to render it) -- the actual illustration set is a
 * design deliverable this engineering pass does not fabricate. Each placeholder renders a dashed
 * frame and its own slot name so it can never be mistaken for shipped art in a screenshot or a
 * visual-regression baseline.
 */

export type AssetName =
  | 'logo'
  | 'logo-mark'
  | 'illustration-empty-state'
  | 'illustration-error-state'
  | 'illustration-celebratory';

export interface AssetDefinition {
  readonly viewBox: string;
  readonly markup: string;
  /** requirement-spec.md §8: every non-text asset needs a real description for its alt text. */
  readonly description: string;
}

function placeholderFrame(params: { viewBox: string; glyph: string; label: string }): string {
  const [, , width, height] = params.viewBox.split(' ');
  const cx = Number(width) / 2;
  const cy = Number(height) / 2;
  return `<rect x="1" y="1" width="${Number(width) - 2}" height="${Number(height) - 2}" rx="12" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 6" opacity="0.5"/><g transform="translate(${cx} ${cy - 10})" fill="currentColor">${params.glyph}</g><text x="${cx}" y="${Number(height) - 14}" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="11" font-weight="600" letter-spacing="0.04em" fill="currentColor" opacity="0.7">${params.label}</text>`;
}

const LOGO_MARK_GLYPH = `<circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M0 -22 L6 -8 L22 -8 L9 2 L14 18 L0 8 L-14 18 L-9 2 L-22 -8 L-6 -8 Z" opacity="0.35"/>`;
const LOGO_MARK_GLYPH_SMALL = `<circle cx="0" cy="0" r="15" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M0 -15 L4 -6 L15 -6 L6 1 L9 12 L0 5 L-9 12 L-6 1 L-15 -6 L-4 -6 Z" opacity="0.35"/>`;
const ILLUSTRATION_GLYPH = `<rect x="-28" y="-20" width="56" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="-12" cy="-4" r="6" fill="currentColor" opacity="0.5"/><path d="M-28 14 L-6 -2 L8 10 L28 -10 L28 14 Z" fill="currentColor" opacity="0.35"/>`;

export const ASSET_REGISTRY: Record<AssetName, AssetDefinition> = {
  logo: {
    viewBox: '0 0 240 64',
    description: 'UMS wordmark placeholder',
    markup: placeholderFrame({
      viewBox: '0 0 240 64',
      glyph: `<g transform="translate(-75 6)">${LOGO_MARK_GLYPH_SMALL}</g><text x="-45" y="10" font-family="Fraunces, Georgia, serif" font-size="22" font-weight="600" fill="currentColor">UMS</text>`,
      label: 'LOGO PLACEHOLDER',
    }),
  },
  'logo-mark': {
    viewBox: '0 0 64 64',
    description: 'UMS logo-mark placeholder',
    markup: placeholderFrame({
      viewBox: '0 0 64 64',
      glyph: LOGO_MARK_GLYPH,
      label: 'MARK PLACEHOLDER',
    }),
  },
  'illustration-empty-state': {
    viewBox: '0 0 200 160',
    description: 'Empty state illustration placeholder',
    markup: placeholderFrame({
      viewBox: '0 0 200 160',
      glyph: ILLUSTRATION_GLYPH,
      label: 'EMPTY-STATE ILLUSTRATION PLACEHOLDER',
    }),
  },
  'illustration-error-state': {
    viewBox: '0 0 200 160',
    description: 'Error state illustration placeholder',
    markup: placeholderFrame({
      viewBox: '0 0 200 160',
      glyph: `<circle cx="0" cy="-4" r="26" fill="none" stroke="currentColor" stroke-width="3"/><line x1="0" y1="-16" x2="0" y2="0" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="0" cy="10" r="2.5" fill="currentColor"/>`,
      label: 'ERROR-STATE ILLUSTRATION PLACEHOLDER',
    }),
  },
  'illustration-celebratory': {
    viewBox: '0 0 200 160',
    description: 'Celebratory moment illustration placeholder',
    markup: placeholderFrame({
      viewBox: '0 0 200 160',
      glyph: `<path d="M0 -26 L4 -8 L22 -8 L8 3 L13 22 L0 11 L-13 22 L-8 3 L-22 -8 L-4 -8 Z" fill="currentColor" opacity="0.5"/><circle cx="-30" cy="10" r="3" fill="currentColor" opacity="0.6"/><circle cx="32" cy="-4" r="3" fill="currentColor" opacity="0.6"/><circle cx="24" cy="20" r="2" fill="currentColor" opacity="0.6"/>`,
      label: 'CELEBRATORY ILLUSTRATION PLACEHOLDER',
    }),
  },
};

/** requirement-spec.md §6: "Assets.*" -- the documented, versioned way every consuming app reads brand assets. */
export const Assets = {
  logo: {
    full: ASSET_REGISTRY.logo,
    mark: ASSET_REGISTRY['logo-mark'],
  },
  illustration: {
    emptyState: ASSET_REGISTRY['illustration-empty-state'],
    errorState: ASSET_REGISTRY['illustration-error-state'],
    celebratory: ASSET_REGISTRY['illustration-celebratory'],
  },
} as const;
