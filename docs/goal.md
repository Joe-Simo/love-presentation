# Love Presentation Redesign Goal

Redesign Love Presentation into a minimal, funny, Awwwards-level interactive experience. Use the attached reference screenshot as the visual source of truth. The target is the exact design direction shown there: warm editorial background, huge serif headline, compact composer form, one large tilted slide card, tiny handwritten-feeling details, red stamp, small proof strip, and very little visual noise.

The concept is:

> Emotionally compromised presentation software.

This should feel like a very serious corporate/legal presentation system that accidentally became a love confession.

## Hard Constraints

- Do not make the site bigger. Make it more iconic.
- Do not turn it into a SaaS dashboard.
- Do not add pricing, testimonials, stats, big galleries, music, 3D worlds, floating hearts, neon, or unnecessary sections.
- Preserve the existing free/private architecture: no account, no database, no uploads, optional HTTPS image URLs only, local generation, private `/p#` hash links, no paid APIs, no AI APIs, no maintenance backend.
- Never expose secrets or API keys.
- Use TypeScript/TSX.
- Do not use CDN Tailwind or CDN Monaco.
- Do not create test pages or throwaway scripts.
- Run `bun run lint` and `bun run typecheck` after implementation and fix all issues.

## Visual Target

Match the screenshot closely:

- Background: warm off-white paper.
- Header: tiny, sparse nav.
- Left side: huge black editorial serif headline with red italic emphasis.
- Left lower area: compact form.
- Right side: one large premium slide preview card, slightly tilted.
- Accent: red/pink only where it matters.
- Details: tiny mono labels, soft paper shadows, red stamp, restrained icons.
- Mood: calm, expensive, minimal, hilarious.

Use this visual system:

```css
--paper: #f7f2ea;
--ink: #111111;
--muted: #77716a;
--accent: #e84a5f;
--stamp: #d94135;
--line: rgba(17, 17, 17, 0.12);
```

Typography:

- Serif headline for the emotional/editorial drama.
- Clean sans UI for controls.
- Tiny mono labels for case-file/exhibit details.

## Homepage Copy

Hero:

```text
Make a love deck.
Try not to look desperate.
```

Subheadline:

```text
A tiny free app for making private slideshow links about why two people are suspiciously perfect together.
```

Microline:

```text
No account. No uploads. No database. No committee approval.
```

Footer:

```text
Open source with ♥ by one emotionally compromised developer.
```

## Composer

Keep the form small:

```text
From
To
Tone: Boardroom / Chaotic / Soft Roast
Optional image URL
Create private link
```

Tone labels:

```text
Boardroom
Very official.

Chaotic
A little unhinged.

Soft Roast
Sweet, but honest.
```

If supported by the existing app, move extra fields into a collapsed section called:

```text
Advanced nonsense
```

Advanced fields may include inside joke, occasion, optional image URLs, and deck length.

## Signature Interaction

Add an Emotional Compromise Slider:

```text
Objective / Suspicious / Compromised / Emotionally Unwell
```

As the slider changes, the live preview slide updates locally and the stamp changes:

```text
REVIEWED
SUSPICIOUS
BIASED
APPROVED, UNFORTUNATELY
```

Do not use AI. Use local template arrays.

## Preview Card

One beautiful live preview card is the visual anchor. Do not show multiple preview cards.

Preview content:

```text
SLIDE 03 / 07
CASE FILE #2025-LOVE-001

EXHIBIT A

Suspicious chemistry.

They laugh at the same dumb stuff.
They finish each other’s sentences.
The science is not explaining this one.

VERDICT:
Highly suspicious.
```

Stamp:

```text
APPROVED, UNFORTUNATELY
```

## Proof Strip

Use only three small proof points:

```text
Private by design
Your deck lives in the link. We don’t store your love crimes.

Share anywhere
Send the link and prepare for smiles, tears, or negotiations.

Yours, not theirs
Edit anytime. Regenerate. Make it more dramatic.
```

## Deck Player

Improve the existing presentation player so the deck feels theatrical while staying minimal.

Suggested 7-slide arc:

1. This is a normal presentation.
2. The presenter is compromised.
3. Exhibit A: Suspicious chemistry.
4. Relationship KPI.
5. Witness statement.
6. Risk assessment.
7. Final ruling.

Add:

- Objectivity meter that decreases every slide.
- Keyboard navigation.
- Tasteful slide transitions.
- “Make it worse” button that locally increases dramatic copy.
- Final ruling animation.
- Tiny confetti only on the final ruling.
- Deterministic fake scores based on the two names.

Fake score examples:

```text
Compatibility Index: 94.7%
Bias Warning: Severe
Snack Alignment: Suspiciously High
Leaving Recommendation: Denied
```

Use deterministic hashing so the same names always produce the same fake numbers.

## Motion

Use motion only where it supports the joke:

- Preview card gently tilts on hover.
- Stamp lands once after deck creation.
- Preview text fades between compromise levels.
- Objectivity meter drains as deck progresses.
- Smooth slide transitions.
- Respect reduced motion.

Avoid constant background motion, particle storms, scroll hijacking, and anything that makes the form annoying.

## Implementation Notes

Inspect the existing code first and reuse the current app architecture and generation logic where possible. This is mainly an art-direction and UX refactor, not a full rebuild.

Split the creator into clean components if useful:

```text
LoveCreator
HeroCopy
DeckComposer
TonePicker
CompromiseSlider
SlidePreview
ShareResult
```

## Acceptance Criteria

- Homepage visually matches the attached screenshot closely in layout, spacing, typography, color, and mood.
- First viewport is the actual product experience, not a marketing landing page.
- One large live preview card anchors the page.
- Form works and creates private hash links.
- Deck player works on desktop and mobile.
- No backend, database, upload service, paid API, or AI API is introduced.
- No secrets are exposed client-side.
- Responsive layout has no text overlap or layout shift.
- Reduced motion is respected.
- `bun run lint` passes.
- `bun run typecheck` passes.
