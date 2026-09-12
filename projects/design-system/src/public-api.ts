/*
 * Public API Surface of @ums/design-system
 */

// Tokens (DSYS-1, DSYS-2, DSYS-3, DSYS-4) -- the typed TypeScript token map generated from
// tools/tokens/source/*.json. Global CSS custom properties/SCSS variables ship as build outputs
// under styles/ (see package README) and are not TypeScript exports.
export * from './lib/tokens/tokens.generated';

// Theming engine (DSYS-5)
export * from './lib/theming/theme.types';
export * from './lib/theming/theme.service';
export * from './lib/theming/motion.service';
export * from './lib/theming/reduced-motion.util';

// Icon system (DSYS-6)
export * from './lib/icon/icon.component';

// Asset registry (DSYS-6)
export * from './lib/assets/asset-registry';
export * from './lib/assets/asset.component';

// Button family (DSYS-7)
export * from './lib/button/button.types';
export * from './lib/button/button.component';
export * from './lib/icon-button/icon-button.component';
export * from './lib/fab/fab.component';
export * from './lib/split-button/split-button.component';

// Form primitives (DSYS-8)
export * from './lib/form-field/form-field.component';
export * from './lib/input/input.types';
export * from './lib/input/input.component';
export * from './lib/textarea/textarea.component';
export * from './lib/select/select.types';
export * from './lib/select/select.component';
export * from './lib/combobox/combobox.types';
export * from './lib/combobox/combobox.component';

// Data display primitives (DSYS-11)
export * from './lib/card/card.types';
export * from './lib/card/card.component';
export * from './lib/badge/badge.types';
export * from './lib/badge/badge.component';
export * from './lib/avatar/avatar.types';
export * from './lib/avatar/avatar.component';
export * from './lib/avatar-group/avatar-group.types';
export * from './lib/avatar-group/avatar-group.component';
export * from './lib/breadcrumbs/breadcrumbs.types';
export * from './lib/breadcrumbs/breadcrumbs.component';
export * from './lib/timeline/timeline.types';
export * from './lib/timeline/timeline.component';

// Data Table (DSYS-12)
export * from './lib/data-table/data-table.types';
export * from './lib/data-table/data-table.component';

// State surfaces (DSYS-17)
export * from './lib/skeleton/skeleton.types';
export * from './lib/skeleton/skeleton.component';
export * from './lib/empty-state/empty-state.component';
export * from './lib/error-state/error-state.component';
export * from './lib/offline-banner/offline-banner.component';

// Navigation (DSYS-13)
export * from './lib/app-shell/app-shell.types';
export * from './lib/app-shell/app-shell.component';
export * from './lib/tab-bar/tab-bar.types';
export * from './lib/tab-bar/tab-bar.component';
export * from './lib/stepper/stepper.types';
export * from './lib/stepper/stepper.component';

// Feedback & overlays (DSYS-15)
export * from './lib/overlay/focus-trap.util';
export * from './lib/modal/modal.types';
export * from './lib/modal/modal.component';
export * from './lib/drawer/drawer.types';
export * from './lib/drawer/drawer.component';
export * from './lib/toast/toast.types';
export * from './lib/toast/toast.service';
export * from './lib/toast/toast-container.component';
export * from './lib/tooltip/tooltip.types';
export * from './lib/tooltip/tooltip.directive';
export * from './lib/popover/popover.component';
export * from './lib/confirmation-dialog/confirmation-dialog.component';
