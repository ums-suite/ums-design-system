# ums-design-system

The shared Angular 22 UI kit and design-token package consumed by all six UMS front-ends ([ADR-0017](https://github.com/ums-suite/ums-platform/blob/main/docs/adr/0017-shared-design-system-package.md)) — the single source of the "extremely gorgeous, cohesive" visual identity across Public, Admission, Student, Faculty, Admin, and Alumni.

- **Full spec:** [`ums-platform/docs/client/design-system/requirement-spec.md`](https://github.com/ums-suite/ums-platform/blob/main/docs/client/design-system/requirement-spec.md) — color tokens, typography (with Bengali script support), spacing/elevation/motion, component inventory, theming.
- Published as a versioned npm package; consuming apps pin a version and upgrade on their own schedule.

## Status

Token pipeline, theming engine, icon/asset registries, and the Button component family are implemented (DSYS-1 through DSYS-7, DSYS-18, DSYS-19) — see [`projects/design-system/README.md`](projects/design-system/README.md) for what's shipped vs. queued. Remaining component families (DSYS-8 through DSYS-17: forms, data table, navigation shell, overlays, data viz, state surfaces) are tracked in [`ums-platform/PLATFORM_BLUEPRINT.md`](https://github.com/ums-suite/ums-platform/blob/main/PLATFORM_BLUEPRINT.md).
