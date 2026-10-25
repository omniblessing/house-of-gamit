# House of Gamit

## Design work

Use the project-installed Apple Design Skill at `.design-rules/SKILL.md` for UI reviews and redesigns. Route topics with `.design-rules/references/hig-lookup.md` and read the relevant reference files. Apply accessibility, layout, typography, interaction, and writing principles to this web app; do not impose native Apple-only navigation conventions. Preserve the family archive's royal forest-and-gold identity.

## Implementation

Edit `web/index.html` for the frontend, then run `pnpm sync:web`. Keep database schemas, existing site identity, storage bindings, and access controls intact during visual work. Do not change production family data for design QA. Use synthetic fixtures in isolated development only.

Run `pnpm test`, `pnpm typecheck`, and the Sites build before publishing changes. Keep runtime secrets out of Git. GitHub source and hosted deployment must both be updated for a completed website change.
