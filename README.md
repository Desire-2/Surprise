# A Knock at the Door

A private, mobile-first anniversary story for My Pinnacle. Built with React, Vite, TypeScript and Framer Motion.

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL shown in the terminal. Add your media first (below), then share the main link only.

## Add your media

Put your own files in `public/media/` using these exact names:

| Slot | File names (first one found is used) |
| --- | --- |
| First romantic music | `music-1.mp3`, `music-1.wav`, `music-1.m4a`, `music-1.ogg` |
| Your voice recording | `voice-message.mp3`, `voice-message.wav`, `voice-message.m4a`, `voice-message.ogg` |
| Cake celebration music | `music-2.mp3`, `music-2.wav`, `music-2.m4a`, `music-2.ogg` |
| Photos (optional) | `photo-1.jpg` … `photo-6.jpg` (png/webp also accepted) |

Nothing is substituted: if a file is missing, that moment simply shows a gentle "still being prepared" message.

You can also open `http://localhost:5173/#studio` on your own device to upload, preview, replace and assign files, set your phone number, and download each file with its deploy name. Those uploads stay in that browser (IndexedDB) and are never sent to a third party.

## Set your number

Edit `public/config.json`:

```json
{ "phoneNumber": "+15551234567" }
```

Or set it in the `#studio` panel. The call button is a standard `tel:` link and only dials when tapped.

## Deploy

```bash
pnpm build
```

Deploy the generated `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages). Share the resulting URL privately. The build uses relative asset paths.

## Commands

- `pnpm dev` — local development
- `pnpm build` — typecheck + production build
- `pnpm typecheck` — TypeScript only
- `pnpm lint` — ESLint

## Browser capabilities

- Web Bluetooth is attempted only after "Connect My Device" is tapped. It can discover devices where supported, but mobile browsers cannot route music audio over Bluetooth — the story says so honestly and guides her to phone settings.
- Speech recognition uses the Web Speech API where available, with a typed fallback.
- Reduced-motion preferences are respected throughout.
