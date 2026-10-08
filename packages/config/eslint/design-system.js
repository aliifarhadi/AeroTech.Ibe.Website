/**
 * Design-system guardrails for code that must use tokens only (packages/ui and the redesigned
 * routes). Each entry is a `no-restricted-syntax` restriction applied to string literals and
 * template strings, which is where Tailwind class names live.
 */
const restrict = (pattern, message) => [
  { selector: `Literal[value=/${pattern}/]`, message },
  { selector: `TemplateElement[value.raw=/${pattern}/]`, message },
];

const COLOUR_MESSAGE =
  'Raw colours are not allowed here. Use a colour token (bg-surface-2, text-muted, border-hairline, …) or currentColor.';

export const designSystemRestrictions = [
  ...restrict(
    '(^|[\\s:])-?[a-z][a-z0-9-]*-\\[[^\\]]+\\]',
    'Arbitrary Tailwind values are not allowed here. Use a token utility, or add a token to packages/ui/src/styles/tokens.css.',
  ),
  ...restrict('#[0-9a-fA-F]{6}\\b|#[0-9a-fA-F]{3}\\b|rgba?\\(', COLOUR_MESSAGE),
  ...restrict(
    '(^|[\\s:])-?(ml|mr|pl|pr|left|right|rounded-l|rounded-r|rounded-tl|rounded-tr|rounded-bl|rounded-br|border-l|border-r)-[a-z0-9]|(^|[\\s:])text-(left|right)(\\s|$)',
    'Physical direction classes break RTL. Use logical ones: ms-, me-, ps-, pe-, start-, end-, rounded-s-, rounded-e-, border-s-, border-e-, text-start, text-end.',
  ),
];

/**
 * For illustration modules (`*.art.ts`, `*.art.tsx`): canvas and SVG drawings whose palettes are
 * data, not UI colours. Everything except the raw-colour rule still applies.
 */
export const illustrationRestrictions = designSystemRestrictions.filter(
  (restriction) => restriction.message !== COLOUR_MESSAGE,
);
