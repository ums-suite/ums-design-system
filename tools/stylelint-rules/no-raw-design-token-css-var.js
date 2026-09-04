// @ts-check
/**
 * DSYS-19 consumption-contract tooling, the SCSS-side twin of
 * tools/eslint-rules/no-raw-design-token-css-var.js. edge-cases.md "A Component Consuming a
 * Token That a Later Token-Set Version Renames or Removes" names this exact mechanism: "a
 * stylelint rule flagging var(--color-*)/var(--shadow-*) usage outside the design system's own
 * source."
 *
 * This plugin is intentionally scoped to *consuming* stylesheets via .stylelintrc.json's
 * `overrides` (currently: projects/catalog, standing in for a real ums-*-web app in this
 * repo) -- design-system's own component SCSS is the token source and is expected to reference
 * `var(--...)` directly.
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

const ruleName = 'ums/no-raw-design-token-css-var';
const messages = utils.ruleMessages(ruleName, {
  rejected: (cssVar) =>
    `Raw CSS custom property reference '${cssVar}' -- use the typed token map (Tokens.* from '@ums/design-system') or a component's own token-driven styling instead of a hardcoded var(--...) reference. See design-decisions.md "Token Versioning & Deprecation Policy".`,
});

const CSS_VAR_PATTERN = /var\(\s*(--[a-zA-Z0-9-]+)/g;

/** @type {import('stylelint').Rule} */
const ruleFn = (enabled) => (root, result) => {
  if (!enabled) return;

  root.walkDecls((decl) => {
    let match;
    CSS_VAR_PATTERN.lastIndex = 0;
    while ((match = CSS_VAR_PATTERN.exec(decl.value))) {
      utils.report({
        message: messages.rejected(match[0].replace(/\s+/g, '')),
        node: decl,
        result,
        ruleName,
      });
    }
  });
};

ruleFn.ruleName = ruleName;
ruleFn.messages = messages;

export default createPlugin(ruleName, ruleFn);
