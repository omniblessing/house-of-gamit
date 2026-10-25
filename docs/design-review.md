# House of Gamit: design review and redesign

## Summary

A responsive web family archive for relatives of all ages. Its primary job is to make family connections understandable and easy to extend. The signature is an original botanical family crest, repeated portrait arches, and a gold lineage diagram on forest green. Apple foundations are applied as web usability principles, without native-only platform rules.

The first version needed work: small muted text, a crowded toolbar, long undifferentiated forms, and a small phone overview. The redesign keeps its royal family identity while using familiar controls and a calmer information hierarchy. This is a code and synthetic-browser review, not a claim of complete accessibility conformance or a production-account data audit.

## Critical

- **What:** The old display used 9–11 px metadata, mixed low-contrast secondary colors, and no keyboard movement for the tree.
- **Why:** `accessibility.md › Vision`: “Support larger text sizes.” `typography.md › Ensuring legibility`: “Use font sizes that most people can read easily.”
- **Fix:** Larger names, darker/lighter semantic contrast tokens, keyboard arrow movement, +/− zoom, 0 to fit, visible focus, an accessible directory alternative, and a phone view that initially uses a readable zoom instead of shrinking the entire tree.

## Improvements

- **High — Hierarchy:** `layout.md › Visual hierarchy`: “Use progressive disclosure to make layouts cleaner and easier to interact with.” Separate navigation from tree controls; move archive tools into More; group optional profile fields in native details sections.
- **High — Family entry:** `entering-data.md › Best practices`: “When possible, offer choices instead of requiring text entry.” Add father/mother/son/daughter/partner/sibling choices that prefill and connect relationships. Selecting a child connects both recorded partners as parents. Parent creation updates the child's record.
- **Medium — Recovery:** `undo-and-redo.md › Best practices`: “Show the results of an undo or redo.” Add session undo for the most recent 20 changes, a visible result message, and reset history when another device changes the tree. Deletion still has a named confirmation and cancel action.
- **Medium — Button clarity:** `buttons.md › Content`: “Ensure that each button clearly communicates its purpose.” Use labeled primary actions, one consistent icon set, descriptive accessible names, and a press state.

## Craft notes

`branding.md › Best practices`: “Ensure branding always defers to content.” The original crest is the visual signature; family names and relationships remain the focal content. Typography pairs a restrained Georgia display face with the platform UI font. The earlier six-button toolbar was removed, rather than adding further ornament.

`motion.md › Best practices`: “Add motion purposefully, supporting the experience without overshadowing it.” Keep brief profile/dialog transitions; no endless decorative animations. Honor reduced motion and reduced transparency.

## Tokens and measured contrast

| Role | Dark | Light |
| --- | --- | --- |
| Background | #101a18 | #f5f3eb |
| Panel | #192622 | #fffef8 |
| Primary text | #f1efe8 | #22362a |
| Secondary text | #a5b1ac | #536457 |
| Gold accent | #d6b984 | #795923 |
| Saved/living indicator | #9bc8b0 | #346b4c |

Computed WCAG relative-luminance contrast against each panel:

- Primary text: dark 13.60:1; light 12.76:1.
- Secondary text: dark 7.07:1; light 6.24:1.
- Accent: dark 8.30:1; light 6.36:1.

These cover unmodified token pairs; faded search results, photos, and composited UI require separate interpretation. Color never serves as the only life-status cue.

Type roles: display 34–49 px, profile 31 px, node names 17 px before canvas zoom, body 14 px, controls 13–16 px, secondary/utility 11–12 px. Mobile form fields are 16 px. Browser zoom is unrestricted. The complete tree overview is intentionally zoomable; phone startup uses a readable 90% scale and Fit exposes the overview.

## Layout and validation

Desktop: persistent sidebar; house heading with archive counts; contained tree workspace; person profile in a dismissible right panel. Phone: compact header; single-column workspace; persistent bottom navigation; profile as a bottom panel. Both use the same data and features.

Tested in an isolated synthetic browser fixture: desktop tree/profile, child quick-add, parent quick-add, profile relationships, undo restoring the previous tree, phone navigation and directory, and parchment theme. Backend tests cover authorization, stale updates, photo storage, invalid dates, and circular ancestry. Production access remains owner-private; the live signed-in account flow is not exercised by these synthetic tests. Touch pinch logic is implemented but not verified on physical hardware.

## Skill installation

Project-scoped manual Codex installation at `.design-rules/`, activated through root `AGENTS.md`. Upstream: https://github.com/dickwu/apple-design-skill . Original SKILL.md, references, and refresh script are retained without rewriting the upstream guideline text. No global skill installation, upstream refresh crawl, or production data reset was performed.
