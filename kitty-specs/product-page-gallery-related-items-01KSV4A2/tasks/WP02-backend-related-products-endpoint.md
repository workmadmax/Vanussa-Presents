---
work_package_id: WP02
title: Backend Related Products Endpoint
dependencies:
- WP01
requirement_refs:
- FR-004
- FR-005
- FR-006
- FR-007
- FR-008
planning_base_branch: kitty/mission-product-page-gallery-related-items-01KSV4A2
merge_target_branch: kitty/mission-product-page-gallery-related-items-01KSV4A2
branch_strategy: Planning artifacts for this feature were generated on kitty/mission-product-page-gallery-related-items-01KSV4A2. During /spec-kitty.implement this WP may branch from a dependency-specific base, but completed changes must merge back into kitty/mission-product-page-gallery-related-items-01KSV4A2 unless the human explicitly redirects the landing branch.
base_branch: kitty/mission-product-page-gallery-related-items-01KSV4A2
base_commit: 94c0e5ae6414987c86f00c2fa1025cf9efeeb175
created_at: '2026-05-31T13:20:06.041982+00:00'
subtasks:
- T004
- T005
- T006
shell_pid: "5836"
history: []
authoritative_surface: backend/apps/products/
execution_mode: code_change
owned_files:
- backend/apps/products/urls.py
- backend/apps/products/views.py
- backend/apps/products/tests.py
tags: []
agent: "codex:gpt-5:implementer:implementer"
---

# WP02 - Backend Related Products Endpoint

Add `GET /api/products/<slug>/related/` to the existing products app.

Requirements:
- Public endpoint.
- 404 when the current product is missing or inactive.
- Return active products only.
- Exclude the current product.
- Prioritize same-category products.
- Fill with recent active products from other categories.
- Return at most 4 products and no pagination wrapper.

## Activity Log

- 2026-05-31T13:20:08Z – codex:gpt-5:implementer:implementer – shell_pid=5836 – Assigned agent via action command
