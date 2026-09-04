// @ts-check
/**
 * DSYS-19 consumption-contract tooling. edge-cases.md "A Component Consuming a Token That a
 * Later Token-Set Version Renames or Removes" / design-decisions.md "Token Versioning &
 * Deprecation Policy": a raw `var(--color-primary)`-style string is invisible to TypeScript, so
 * a future token rename can silently break code that bypasses the typed token map. This rule
 * flags any string literal (plain or template) containing a `var(--...)` reference to a design
 * token custom property, in TypeScript source.
 *
 * Scope note: this only covers `.ts` sources. `var(--...)` written directly in SCSS/CSS is the
 * separate, parallel stylelint rule in tools/stylelint-rules -- together they're the two places
 * a raw token reference can actually appear; an Angular *template* (.html) `[style.x]` binding
 * is technically a third surface this rule does not parse (that would require the
 * @angular-eslint template parser), left as a documented gap rather than a silently-incomplete
 * claim of full coverage.
 *
 * Where this rule applies (which files are exempt as the token source itself) is configured in
 * eslint.config.js, not here -- this file only knows how to detect the pattern.
 */

const CSS_VAR_PATTERN = /var\(\s*--[a-zA-Z0-9-]+/;

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow raw var(--token-name) CSS custom property references in application code; use the typed token map (Tokens.*) from @ums/design-system instead.',
    },
    schema: [],
    messages: {
      rawCssVar:
        "Raw CSS custom property reference '{{ snippet }}' found in TypeScript source. Import the typed token map (`Tokens.*`) from '@ums/design-system' instead of hardcoding a CSS variable name by hand -- see design-decisions.md 'Token Versioning & Deprecation Policy'. A future token rename is invisible to a string literal like this one.",
    },
  },
  create(context) {
    /** @param {import('estree').Node} node @param {string} value */
    function check(node, value) {
      const match = value.match(CSS_VAR_PATTERN);
      if (match) {
        context.report({ node, messageId: 'rawCssVar', data: { snippet: match[0] } });
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          check(node, node.value);
        }
      },
      TemplateElement(node) {
        check(node, node.value.raw);
      },
    };
  },
};

export default rule;
