# Placement Portal CSS map

This directory gives the stylesheets clear names and a predictable place to live. This refactor is deliberately conservative: the existing declarations and broad selector behavior are retained, and the two consecutive contrast files are combined in their original order.

## Files and responsibilities

- `global.css` â€” legacy global/base layer and Tailwind import. It still contains some mixed concerns from the former `index.css`; split those only in a later, screenshot-verified pass.
- `pages/landing.css` â€” public landing/marketing page.
- `workspace-shared.css` â€” shared workspace finish and utility-level polish.
- `components/shared-ui.css` â€” shared navigation, cards, controls, dialogs, and related UI consistency rules.
- `contrast/contrast-safety.css` â€” general contrast rules, followed by the original workflow-specific contrast rules. Do not reorder the two blocks inside this file.
- `design-system/overrides.css` â€” design tokens, compatibility aliases, and final cascade safeguards. This remains the **last global stylesheet imported by `main.jsx`** until its rules are migrated and visually verified.
- `layouts/admin-workspace.css` â€” admin-shell layout and workspace styling, loaded by `AdminLayout.jsx`.
- `pages/profile-jobs.css` â€” profile/jobs/job-details-specific safeguards.
- `base/page-boundaries.css` â€” viewport width and overflow boundaries that previously sat at the top of the profile/jobs stylesheet. It is imported first by `pages/profile-jobs.css` so its cascade timing and position are retained.

## Global import order

`main.jsx` intentionally imports the following global layers in order:

1. `global.css`
2. `pages/landing.css`
3. `workspace-shared.css`
4. `components/shared-ui.css`
5. `contrast/contrast-safety.css` (general contrast, then workflow contrast)
6. `design-system/overrides.css` (must remain last)

The admin and profile/job styles are imported by the same React modules as before, using their new paths.

## Rules for future CSS changes

1. Add a new rule to one owning stylesheet; do not copy an existing selector into another file just to override it.
2. Keep page rules scoped to a page root/class where practical. Avoid adding global `html`, `body`, or `#root` rules to a page stylesheet.
3. Keep design tokens and existing compatibility aliases in `design-system/overrides.css` until a token-only extraction can be tested independently.
4. Do not delete duplicate-looking contrast, heading, form, card, or responsive declarations by text search alone. Selectors may intentionally override earlier rules.
5. Before the next consolidation pass, compare the landing page, admin dashboard, forms/modals, profile, job listings, and job details at mobile and desktop widths. Build and lint after each logical change.

This cleanup is an organizational pass, not a claim that every historical overlap has been deleted. Keeping that distinction avoids silently changing established styling.