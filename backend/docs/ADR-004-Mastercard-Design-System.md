# ADR-004: Mastercard-Inspired Design System

## Status
Accepted

## Context
The previous user interface lacked a cohesive premium feel, which is essential for a high-end institutional research and advisory firm. We needed a UI overhaul that communicated trust, exclusivity, and modern aesthetics.

## Decision
We adopted a strict UI guideline documented in `DESIGN.md` inspired by Mastercard's "Lifted Cream" design language.
- **Colors:** Dominant use of Canvas Cream (`#F3F0EE`) for backgrounds, true Black (`#000000` or `#18181B`) for text and CTAs, with minimal accent colors (Emerald, Red, Blue).
- **Typography:** `Sofia Sans` for structural components, and modern sans-serifs for readability.
- **Shapes:** Extensive use of extreme pill radiuses (`rounded-full`) for buttons and stadium/circular cards (`rounded-[32px]` or `rounded-[40px]`) to soften the interface.
- **Shadows:** Minimal, tight shadows for depth without muddiness.

## Consequences
- **Positive:** A striking, highly differentiated aesthetic compared to generic Tailwind UI templates. Reinforces the brand's premium positioning.
- **Negative:** Requires custom CSS classes and strict adherence to the design tokens, preventing the use of off-the-shelf component libraries without heavy customization.
