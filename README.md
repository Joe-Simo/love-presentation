# Love Presentation

A minimalist Next.js app for making funny private slideshow links. It uses Bun, App Router, Tailwind CSS, shadcn/ui primitives, Three.js, GSAP, and Geist.

## Commands

```bash
bun run dev
bun run lint
bun run typecheck
bun test
bun run build
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Sharing

Share links use `/p#...` hash fragments with self-contained payloads. The app does not upload, store, or proxy user photos; optional image URLs must be HTTPS and are loaded directly by the recipient browser with `no-referrer`.

## Deploy

Deploy on Vercel with the default Next.js build settings.
