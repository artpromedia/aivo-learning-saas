export {
  AIVO_COLORS,
  AIVO_TYPOGRAPHY,
  AIVO_SPACING,
  AIVO_BORDER_RADIUS,
  AIVO_SHADOWS,
  AIVO_GRADIENTS,
  AIVO_ANIMATION,
  AIVO_TRANSITIONS,
  tokens,
} from "./tokens.js";

export type {
  AivoColors,
  AivoTypography,
  AivoShadows,
  AivoGradients,
  AivoTokens,
} from "./tokens.js";

export { AIVO_BRAND } from "./email.js";
export type { AivoBrandEmail } from "./email.js";

export {
  AIVO_FLUTTER_COLORS,
  AIVO_FLUTTER_TYPOGRAPHY,
  AIVO_FLUTTER_SPACING,
  AIVO_FLUTTER_BORDER_RADIUS,
} from "./flutter.js";
export type { AivoFlutterColors } from "./flutter.js";

import { tokens } from "./tokens.js";

/**
 * Recursively flattens a nested object into CSS custom property declarations.
 * Keys are joined with hyphens and prefixed with `--`.
 *
 * @example
 * flattenToCssVars({ color: { primary: { 500: "#7c3aed" } } })
 * // => "--color-primary-500: #7c3aed;\n"
 */
function flattenToCssVars(
  obj: Record<string, unknown>,
  prefix: string,
): string {
  let result = "";
  for (const [key, value] of Object.entries(obj)) {
    const cssKey = `${prefix}-${key}`;
    if (typeof value === "string" || typeof value === "number") {
      result += `${cssKey}: ${String(value)};\n`;
    } else if (typeof value === "object" && value !== null) {
      result += flattenToCssVars(value as Record<string, unknown>, cssKey);
    }
  }
  return result;
}

/**
 * Converts the full AIVO token object into a CSS custom properties string.
 * Each token path becomes a CSS variable following `--{category}-{name}-{scale}` naming.
 *
 * @returns A string of CSS custom property declarations suitable for injection
 *          into a `:root` block or `<style>` tag.
 *
 * @example
 * const css = cssVariables();
 * // => "--color-purple-500: #7c3aed;\n--color-teal-500: #14b8c8;\n..."
 */
export function cssVariables(): string {
  const sections: Record<string, unknown> = {
    color: tokens.colors,
    font: {
      family: { sans: tokens.typography.fontFamily },
      weight: tokens.typography.fontWeights,
    },
    "font-size": Object.fromEntries(
      Object.entries(tokens.typography.scale).map(([name, val]) => [
        name,
        val.fontSize,
      ]),
    ),
    "line-height": Object.fromEntries(
      Object.entries(tokens.typography.scale).map(([name, val]) => [
        name,
        val.lineHeight,
      ]),
    ),
    spacing: tokens.spacing,
    radius: tokens.borderRadius,
    shadow: tokens.shadows,
    transition: tokens.transitions,
  };

  return flattenToCssVars(sections, "-");
}
