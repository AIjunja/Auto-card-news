# Design and References

Use this reference before writing `design.md`, `channel.css`, card layouts, or project-level CSS.

## Design Strategy

Use a channel design system plus project-level variation. The channel keeps consistent typography, color, layout, and CTA rules. Each project can adjust visual emphasis, card rhythm, and special components.

## carousel-automation Reference

Borrow the idea of HTML/CSS templates rendered by Playwright. Useful concepts:

- Fixed ratio viewport
- One card per render target
- CSS-driven layout
- Browser screenshot export
- Content guidelines to prevent overflow

Do not inherit DataTalksClub visual style or unimplemented frame assumptions.

## shadcn/ui Reference

Use shadcn/ui as a detail reference for organized information components:

- Cards
- Badges
- Tabs
- Stats
- Callouts
- Compact lists
- Buttons and CTA blocks

The carousel should not look like an app screen unless the content is an app demo. Borrow clarity, spacing, hierarchy, and component discipline.

## oh-my-design Reference

Use an oh-my-design style mindset for `design.md`. Capture:

- Brand or channel philosophy
- Audience and persona
- Voice and tone
- Typography
- Color
- Layout
- Composition patterns
- Motion principles
- Avoid rules
- Review checklist

## Design Review

Before rendering final assets, check:

- Text fits inside each card.
- Important text is visible at mobile size.
- Card rhythm does not feel repetitive.
- CTA matches the active channel.
- Motion, if used, supports understanding or retention.
- Project-specific CSS does not fight `channel.css`.
