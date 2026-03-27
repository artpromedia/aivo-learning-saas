// Automated brand compliance checker for email templates
// Validates every template against AIVO brand requirements

export interface BrandAuditResult {
  template: string;
  passed: boolean;
  checks: Array<{
    rule: string;
    passed: boolean;
    detail?: string;
  }>;
}

export function auditEmailHtml(templateName: string, html: string): BrandAuditResult {
  const checks: BrandAuditResult["checks"] = [];

  // 1. Purple gradient header
  const hasGradientHeader = html.includes("linear-gradient(135deg, #915ee3") || html.includes("linear-gradient(135deg, #7C4DFF");
  checks.push({
    rule: "Purple gradient header present",
    passed: hasGradientHeader,
    detail: hasGradientHeader ? undefined : "Missing linear-gradient header with purple brand colors",
  });

  // 2. Inter font family
  const hasInterFont = html.includes("Inter");
  checks.push({
    rule: "Inter font family used",
    passed: hasInterFont,
    detail: hasInterFont ? undefined : "Missing Inter font family declaration",
  });

  // 3. #7C3AED CTA button
  const hasCtaColor = html.includes("#7C3AED");
  checks.push({
    rule: "CTA button uses #7C3AED",
    passed: hasCtaColor,
    detail: hasCtaColor ? undefined : "Missing #7C3AED CTA button color",
  });

  // 4. Footer present
  const hasFooter = html.includes("AIVO Learning") && (html.includes("All rights reserved") || html.includes("notification preferences"));
  checks.push({
    rule: "Footer with AIVO branding present",
    passed: hasFooter,
    detail: hasFooter ? undefined : "Missing footer with AIVO branding",
  });

  // 5. Dark mode support
  const hasDarkMode = html.includes("prefers-color-scheme: dark");
  checks.push({
    rule: "Dark mode @media query present",
    passed: hasDarkMode,
    detail: hasDarkMode ? undefined : "Missing prefers-color-scheme: dark media query",
  });

  // 6. 600px max-width
  const hasMaxWidth = html.includes("max-width: 600px") || html.includes('width="600"');
  checks.push({
    rule: "600px max-width container",
    passed: hasMaxWidth,
    detail: hasMaxWidth ? undefined : "Missing 600px max-width on email container",
  });

  // 7. 12px border-radius
  const hasBorderRadius = html.includes("border-radius: 12px");
  checks.push({
    rule: "12px border-radius on container",
    passed: hasBorderRadius,
    detail: hasBorderRadius ? undefined : "Missing 12px border-radius on container",
  });

  // 8. 8px border-radius on CTA button
  const hasCtaRadius = html.includes("border-radius: 8px");
  checks.push({
    rule: "8px border-radius on CTA button",
    passed: hasCtaRadius,
    detail: hasCtaRadius ? undefined : "Missing 8px border-radius on CTA button",
  });

  // 9. No "Click here" text
  const hasClickHere = html.toLowerCase().includes("click here");
  checks.push({
    rule: "No 'Click here' text in CTAs",
    passed: !hasClickHere,
    detail: hasClickHere ? "Found 'Click here' text — use descriptive CTA text" : undefined,
  });

  // 10. Box shadow on container
  const hasBoxShadow = html.includes("box-shadow");
  checks.push({
    rule: "Box shadow on container",
    passed: hasBoxShadow,
    detail: hasBoxShadow ? undefined : "Missing box-shadow on email container",
  });

  // 11. f4f4f8 body background
  const hasBodyBg = html.includes("#f4f4f8");
  checks.push({
    rule: "Body background #f4f4f8",
    passed: hasBodyBg,
    detail: hasBodyBg ? undefined : "Missing #f4f4f8 body background color",
  });

  // 12. WCAG: role="presentation" on layout tables
  const hasPresRole = html.includes('role="presentation"');
  checks.push({
    rule: "Layout tables use role=\"presentation\"",
    passed: hasPresRole,
    detail: hasPresRole ? undefined : "Missing role=\"presentation\" on layout tables for accessibility",
  });

  // 13. HTML lang attribute
  const hasLang = html.includes('lang="en"');
  checks.push({
    rule: "HTML lang attribute present",
    passed: hasLang,
    detail: hasLang ? undefined : "Missing lang=\"en\" attribute on html element",
  });

  // 14. 44px minimum touch targets
  const hasMinTouchTarget = html.includes("min-height: 44px") || html.includes("padding: 14px 32px") || html.includes("padding: 12px 32px");
  checks.push({
    rule: "44px minimum touch targets on CTA",
    passed: hasMinTouchTarget,
    detail: hasMinTouchTarget ? undefined : "CTA button may not meet 44px minimum touch target",
  });

  return {
    template: templateName,
    passed: checks.every((c) => c.passed),
    checks,
  };
}

export function auditAllTemplates(
  renderedTemplates: Array<{ name: string; html: string }>,
): { allPassed: boolean; results: BrandAuditResult[] } {
  const results = renderedTemplates.map((t) => auditEmailHtml(t.name, t.html));
  return {
    allPassed: results.every((r) => r.passed),
    results,
  };
}
