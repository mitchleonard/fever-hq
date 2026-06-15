# Fever HQ — PWA

Personalized Indiana Fever superfan command center. Installable web app, push-notification capable, conversational AI via Anthropic API, calendar via ICS feed.

## Stack
- Next.js 15 (App Router, RSC)
- TypeScript
- Tailwind v4 (`@tailwindcss/postcss`)
- shadcn-style component patterns (owned code, no library install)
- Motion (`motion/react`)
- Phosphor icons
- Anthropic SDK
- Web Push API (VAPID)

## Brand
- Colors: Fever Navy `#002D62` + Fever Gold `#FFCD00`
- Typography: Bebas Neue (display) + Geist (body) + Geist Mono (numbers)
- Voice: sports-radio energy

## Local dev
```bash
npm install
npm run dev
```

## Generate VAPID keys (first-time push setup)
```bash
npm run vapid
```
Copy the output keys into `.env.local`.

## Deploy
Push to GitHub, import to Vercel. Set env vars from `.env.example`.
