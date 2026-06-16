// Drop-in entry for mitchleonard.com data/caseStudies.js.
// Schema matches strava-dashboard (#002) and hackathon-skill (#001) exactly.
// Insert BEFORE the strava-dashboard entry so the personal projects list reads newest-first.
// Add 'fever-hq' to PERSONAL_SLUGS in app/projects/page.tsx at the front.

{
  slug: 'fever-hq',
  title: 'Fever HQ',
  subtitle: 'A personalized Indiana Fever superfan PWA. iOS push notifications, conversational chat, auto-syncing calendar.',
  description: 'A custom-branded WNBA companion app for one very devoted fan, after the original iMessage bot idea hit personal-vs-enterprise gates.',
  company: null,
  client: null,
  tags: ['Hackathon', 'AI Chatbot', 'API'],
  url: 'https://feverhq.mitchleonard.com',
  ogImage: '/fever-hq/og.png',
  results: [
    { value: '~90 min', label: 'Start to ship' },
    { value: '5', label: 'Channel pivots' },
    { value: '$3/yr', label: 'Infrastructure' },
  ],
  context: `My wife is a Caitlin Clark and Indiana Fever superfan. Keeping up with every game means jumping between ESPN, Yahoo Sports, the team site, and her own calendar — and none of those apps are built for one team or one fan. She isn't techy. She just wants the right info to land in front of her at the right time, on the device she already uses.`,
  challenge: `The first idea was an iMessage bot — texts from "Fever HQ" 15 minutes before every tipoff, branded as a contact she'd save like any other person. Two walls killed it. iMessage limits each Apple ID to a single "Start new conversations from" identity, so bot sends would have read as coming from me, not from Fever HQ. The SMS-provider route around it kept asking for ~$35 in A2P 10DLC registration plus a paid Twilio account before I'd sent a single message — a personal-project budget couldn't justify that for one user.`,
  insight: null,
  role: null,
  execution: [
    'Pivoted from iMessage / SMS to a custom PWA on mitchleonard.com after the single-identity constraint on iMessage and the $35+ KYC tax on every consumer SMS provider made the original idea unworkable for a hobby project.',
    'Built a chat-first interface on Next.js 15 + Tailwind v4 with original Fever Navy + Gold + Red branding, custom wordmark, Bebas Neue display type, and a court-line gold accent rule.',
    'Wired iOS Web Push (iOS 16.4+) for pregame alerts 15 minutes before tipoff. Channel display calls out YouTube TV availability for the major broadcast networks she actually has.',
    'Streamed Anthropic Claude Haiku 4.5 into the chat surface with a sports-radio system prompt and Central-Time conversion baked in — schedule data sits in Eastern as the broadcaster convention; conversion happens at the edge.',
    'Wrote a pure-TypeScript ICS generator with stable per-game UIDs so her Google Calendar auto-updates when the WNBA shifts the schedule mid-season.',
    'Added a season detector that silently switches the outbound channel from push to email digest from Nov-Apr — off-season runs at zero cost, no code change.',
  ],
  impact: null,
  visuals: [
    { type: 'image', src: '/fever-hq/preview.png', caption: 'Home and schedule surfaces on iPhone, as they ship to feverhq.mitchleonard.com', featured: true },
    { type: 'image', src: '/fever-hq/icon-512.png', description: 'Custom Fever-inspired app icon — Navy + Gold + Red palette, original wordmark, no team IP.', annotated: true },
  ],
  next: 'strava-dashboard',
},
