# 260727 — MOW Proof Sheet UI Rebuild

Rebuilt every page except home hero, /login, /register to the "MOW Proof Sheet" direction (darkroom contact-sheet / studio console): Bricolage Grotesque display type, crop-mark frames, mono annotations, folio labels, film-strip rails, LED status, ghost indexes, session-log booking flow, console admin. User-approved via 4 mockups on claude.ai/design (project "MowStudio UI System", group "Redesign Proposal"); mockups archived in `plans/260727-0140-GH-26-proof-sheet-rebuild/mockups/`.

- Spec: `docs/superpowers/specs/2026-07-27-mow-proof-sheet-ui-design.md`
- Execution: wave-based parallel agent tracks with per-track adversarial review + opus final review + visual sweep; ledger in `.superpowers/sdd/progress.md`
- Superseded editorial page styles removed (auth-split/hero/display primitives kept); new layers `proof-sheet.css`, `proof-admin.css`; 5 new UI primitives (crop-frame, film-strip, led-status, folio-label, ghost-index)
- Notable fixes: CSS comment containing `*/` broke dev-mode parsing site-wide; ScrollReveal gained a failsafe reveal timer; CTA touch targets/typography restored; film-strip moved to next/image
- Verification: ci:verify 189/189, build green (26 routes), full Playwright 46 pass / 4 skip / 0 fail, dev-mode visual check of /studios confirmed grid + reveals
- Zero behavior/domain/API changes; hero/login/register byte-identical

Follow-ups (non-blocking): unify duplicated LED device (`.led-status` vs `.console-status`); consider consolidating `resolveRoomMaterial` helpers; DB reset tooling for e2e fixture dates.
