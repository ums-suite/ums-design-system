# ums-design-system

The shared Angular 22 UI kit and design-token package consumed by all six UMS front-ends ([ADR-0017](https://github.com/ums-suite/ums-platform/blob/main/docs/adr/0017-shared-design-system-package.md)) — the single source of the "extremely gorgeous, cohesive" visual identity across Public, Admission, Student, Faculty, Admin, and Alumni.

- **Full spec:** [`ums-platform/docs/client/design-system/requirement-spec.md`](https://github.com/ums-suite/ums-platform/blob/main/docs/client/design-system/requirement-spec.md) — color tokens, typography (with Bengali script support), spacing/elevation/motion, component inventory, theming.
- Published as a versioned npm package; consuming apps pin a version and upgrade on their own schedule.

## Status

All of DSYS-1 through DSYS-9, DSYS-11 through DSYS-19 are implemented — tokens, theming, icon/asset registries, the full component inventory (forms, data table, navigation shell, overlays, data visualization, state surfaces), the visual-regression/a11y suite, and the consumption-contract lint rules. See [`projects/design-system/README.md`](projects/design-system/README.md) for the per-ticket breakdown. **DSYS-10 (Rich text editor) is the one remaining gap** — not yet built; see that README's note for details.
