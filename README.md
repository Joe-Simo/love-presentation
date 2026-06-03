# Love Presentation

A minimalist Next.js app for making funny private slideshow links about why two people are suspiciously perfect together.

Live site: [lovepresentation.com](https://lovepresentation.com)

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

Share links use `/p#...` hash fragments with self-contained, encoded payloads. The app does not upload, store, or proxy user photos; optional image URLs must be HTTPS and are loaded directly by the recipient browser with `no-referrer`. The image host can still receive the recipient browser's image request.

Because the slideshow data lives in the URL hash, the share token is not sent to the server during normal HTTP requests. Share tokens are not encrypted. Anyone with the full link can view the deck, so users should treat links as private but shareable.

## Deploy

Deploy on Vercel with the default Next.js build settings.

## License

MIT
