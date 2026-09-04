/** requirement-spec.md §7: "Three modes: light, dark, system." */
export type ThemeMode = 'light' | 'dark' | 'system';

/** The mode a theme mode actually paints as, once "system" is resolved against the OS preference. */
export type ResolvedTheme = 'light' | 'dark';

/**
 * requirement-spec.md §2 Principle #4: the same token set expressed at two intensities. Only
 * --type-heading-1's family/weight currently varies by register (requirement-spec.md §4) --
 * ums-admin-web and ums-faculty-web set 'operational' on their app root; every other app stays
 * on the 'marketing' default.
 */
export type TypographyRegister = 'marketing' | 'operational';
