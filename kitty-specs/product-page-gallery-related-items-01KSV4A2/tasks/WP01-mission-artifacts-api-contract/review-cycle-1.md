---
affected_files:
- path: kitty-specs/product-page-gallery-related-items-01KSV4A2/tasks.md
cycle_number: 1
mission_slug: product-page-gallery-related-items-01KSV4A2
reproduction_command: spec-kitty agent tasks status --mission product-page-gallery-related-items-01KSV4A2
reviewed_at: '2026-05-31T13:04:05Z'
reviewer_agent: codex:gpt-5:reviewer:reviewer
verdict: rejected
wp_id: WP01
---

**Issue 1: `tasks.md` marks future WP work as complete before those WPs have run.**

`kitty-specs/product-page-gallery-related-items-01KSV4A2/tasks.md` currently marks
T004-T010, WP02/WP03 checklist items, and all validation gates as `[x]` even
though canonical Spec Kitty status still has WP02 and WP03 in `planned`. This
creates a contradictory mission state: the board says dependent WPs have not
started, while the task artifact says their subtasks and full validation are
already complete.

Fix:
- Keep WP01 subtasks T001-T003 checked.
- Reset T004-T010 to pending until WP02/WP03 formally implement and mark them.
- Reset WP02/WP03 checklist items to pending until their respective WPs run.
- Reset final validation checkboxes to pending unless they are explicitly moved
  into a completed final-validation artifact after all WPs are reviewed.

After fixing, rerun:

```bash
spec-kitty agent mission finalize-tasks --mission product-page-gallery-related-items-01KSV4A2 --validate-only --json
```
