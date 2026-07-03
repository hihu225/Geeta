<p align="center">
  <img src="frontend/public/3.png" alt="GeetaGPT" width="120" />
</p>

<h1 align="center">GeetaGPT 🕉️</h1>

<p align="center">
  <em>A premium, spiritual chat companion — timeless guidance from the Bhagavad&nbsp;Gita, in your pocket.</em>
</p>

<p align="center">
  <a href="https://geeta-gpt14.vercel.app/">Live web demo</a> ·
  <a href="#-quick-start">Quick start</a> ·
  <a href="#-architecture">Architecture</a> ·
  <a href="#-feature-catalogue">Features</a>
</p>

---

## Table of contents

- [What it is](#-what-it-is)
- [Feature catalogue](#-feature-catalogue)
- [Screenshots & feel](#-screenshots--feel)
- [Tech stack](#-tech-stack)
- [Architecture](#-architecture)
- [Design system](#-design-system)
- [Data model](#-data-model)
- [API surface](#-api-surface)
- [Quick start](#-quick-start)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Contact](#-contact)

---

## 🎯 What it is

GeetaGPT is a **conversational spiritual companion**. You bring life's questions — grief, purpose, doubt, career, relationships — and Krishna's guidance from the Bhagavad Gita meets you where you are. Powered by an LLM, grounded in the Gita's source material, and wrapped in a premium "sacred dark" UI that treats every response like a small piece of scripture.

It's a **full-stack production app**:

- Web app (React 19 + Vite) served at `geeta-gpt14.vercel.app`
- Android build via Capacitor (share sheets, filesystem, speech recognition, push notifications)
- Node/Express + MongoDB backend with per-user auth, per-session memory, and AI-generated theme discovery
- Firebase for authentication, email verification, password reset, and FCM push
- GROQ (Llama 3.3 70B) for chat generation, Sanskrit translation, and daily-quote curation

---

## ✨ Feature catalogue

**Conversation model — sessions with real memory**
- Every message you send belongs to a **session** with its own `sessionId`
- Within a session, the model gets the **last 10 exchanges** (oldest → newest) as context — Krishna remembers what you just said
- Hit **New Conversation** → fresh sessionId → clean slate, no context bleed
- Sidebar lists all your conversations grouped by session (not a flat message list) — click one to jump back in and keep chatting *inside that memory*
- Old chats without a session are collapsed into a single "Earlier Wisdom" bucket

**Auto-titled conversations**
- After 2+ exchanges, an AI titler generates a 3–5 word title asynchronously and stores it on a `SessionMeta` doc
- Sidebar switches from truncated first-question to the proper title the next render
- You can rename it manually (✎ hover button) or delete the whole session (🗑 hover button, with confirmation)

**Deeplinks**
- Any answer's Share button generates a link like `/chat?s=<sessionId>`
- Recipient taps → app loads that exact session → they can pick up the thread with full memory

**Wisdom of the day**
- Curated daily shloka card at the top of chat: Sanskrit verse (with a soft word-by-word reveal animation), translation, reference, and a reflection prompt
- Deterministic rotation via day-of-year — same verse across all your devices today
- "Ask Krishna about this" pre-fills the input with the reflection prompt

**Streak counter**
- 🪔 pill under the greeting shows your consecutive-day practice streak
- Flips to 🔥 at 7+ days
- Tracks longest streak internally; increments once per calendar day; persists to localStorage

**Shareable answer cards**
- Every Krishna response has a **Share Image** button that renders a beautiful 1080×1350 card (verse + question + response + gold ornament + brand) via `html2canvas`
- Fires the native share sheet on mobile (Capacitor) or Web Share API on desktop; falls back to PNG download

**Explore Themes**
- AI-clustered themes derived from your recent conversations
- Cached-first (`GET /api/themes`) — clicking the button is instant instead of triggering a fresh AI call
- Explicit `↻ Refresh` pill regenerates themes personalized to your latest chats
- Curated fallback themes (Karma Yoga, Sthita Prajna, Bhakti, Jnana) if the AI errors — the UI never breaks

**Copy, Share, Export**
- Copy button on every response (icon flips to ✓ on success, toast confirmation)
- Export any answer as a formatted PDF
- Language toggle (English ↔ Hindi)
- Bookmark full conversations as favorites (segregated view — favorites only, no other chat noise)

**Search**
- Full-text search across every conversation you've had (question, response, Hindi, shloka, translation)
- Right at the top of the sidebar, always available

**Empty-state suggestion pills**
- On a fresh conversation, 4 rotating starter questions ("What is dharma in modern life?", "How to accept loss and grief?", …)
- One click → prefills the input

**Notifications**
- Daily wisdom push at your chosen local time (Firebase Cloud Messaging + node-cron scheduler on the backend)
- Notification-history page with mark-read / clear-all
- Per-user prefs: enabled, time, timezone, language, quote type

**Premium UX**
- Framer-motion page transitions (fade + blur → sharpen) between every route
- Ornamental SVG dividers (lotus / mandala) between sections
- Themed toasts (glass + gold left border, gold gradient progress bar)
- Global button press feedback (scale-on-active, brightness on hover, focus rings)
- 44px icon FABs in the top corners: hamburger for sidebar, avatar for account settings, ⭐ pill for favorites
- Redesigned 404 page (Om + "This path leads nowhere" + gold return button)

**Sacred dark → sacred light**
- Full dual-theme system — the moon/sun toggle flips **every design token** (`body.light` class swaps the entire palette)
- Dark: warm midnight backgrounds, saffron/gold accents, cream text
- Light: clean ivory backgrounds, deep coffee text, richer saffron accents

---

## 📸 Screenshots & feel

The visual language:

- **Fonts** — Cormorant Garamond (display, italic) for headings, quotes, shlokas · Inter for body & UI
- **Palette (dark)** — `#120a24` void → radial midnight gradient → gold `#E6B85C` / saffron `#F5A623` accents on cream `#FBF1DE` text
- **Palette (light)** — ivory `#FAF6EC` → deep coffee `#1F1408` text → rich saffron `#BF5A0E` accents
- **Motion** — spiritual easing curve `cubic-bezier(0.16, 1, 0.3, 1)`, 420ms page transitions, 60ms button press feedback

---

## 🚀 Tech stack

**Frontend**
- React 19 + Vite 6 (dev server + production build)
- react-router-dom for routing
- framer-motion for page transitions
- react-icons, lucide-react for iconography
- html2canvas for shareable image generation
- jsPDF for PDF export
- Capacitor 7 (Android build): Share, Filesystem, SpeechRecognition, Push Notifications, Preferences
- Firebase Web SDK for auth + FCM

**Backend**
- Node.js + Express
- MongoDB (Mongoose): `User`, `Chat`, `Theme`, `SessionMeta`, `Notification` collections
- Firebase Admin (server-side token verification + FCM push)
- GROQ SDK (Llama 3.3 70B Versatile) for chat generation + translation
- express-rate-limit, cors, helmet-adjacent middleware
- node-cron for scheduled daily wisdom broadcasts

**Deploy**
- Frontend: Vercel
- Backend: Render
- Mobile: Android APK via Capacitor + Android Studio

---

## 🏗 Architecture

```
             ┌────────────────────────────────────────┐
             │  React + Vite (web)  ·  Capacitor (APK) │
             │  Session state, deeplinks, share cards  │
             └────────────────┬───────────────────────┘
                              │  Firebase token  ·  JWT
                              ▼
             ┌────────────────────────────────────────┐
             │        Express API (Node.js)           │
             │  ─  /api/message   (chat, session-aware)│
             │  ─  /api/conversations   (list, patch, delete)
             │  ─  /api/chats     (individual CRUD)   │
             │  ─  /api/themes    (cached-first + AI)  │
             │  ─  /api/notifications                 │
             └───┬──────────────┬────────────────┬────┘
                 │              │                │
                 ▼              ▼                ▼
             MongoDB       GROQ (LLM)      Firebase (Auth + FCM)
        (chats, themes,      Llama 3.3
         sessions, users,     70B
         notifications)
```

**Session-scoped memory** — every chat POST includes `sessionId`. Server persists it on the `Chat` doc. On generation, the last 10 exchanges from *that session only* are fed to the model, reversed to chronological order. Zero cross-session leakage.

**Auto-title async fire-and-forget** — after saving a chat, `maybeAutoTitle({ userId, sessionId })` runs without blocking the response. It fetches up to 4 messages, prompts the AI for a 3–5 word title, and upserts `SessionMeta`. `autoTitled: true` prevents re-runs.

**Theme caching** — `GET /api/themes` returns cached themes instantly unless `?refresh=true`. AI parse errors fall back to a curated `FALLBACK_THEMES` array so the UI never breaks. Regex escaping on both `/api/themes` name-collision checks and `/api/themes/search/:tag`.

**Deeplink round-trip** — `handleShare` builds `${origin}/chat?s=${sessionId}` and attaches it to both the share text and the native share `url`. On mount, Chatbot reads `?s=` from `useLocation`, calls `switchToSession`, and strips the query so a refresh doesn't re-fire the switch.

---

## 🎨 Design system

Central token file: `frontend/src/theme.css`.

- **Semantic color tokens** — `--bg-void` `--bg-primary` `--bg-elevated`, `--text-primary` `--text-body` `--text-secondary` `--text-muted` `--text-faint`, `--gold` `--gold-bright` `--saffron`, `--error` `--success`, `--border-subtle` `--border-soft` `--border-strong`
- **Gradients** — `--grad-bg` (radial midnight), `--grad-gold` (button gradient), `--grad-glass` (frosted panels), `--grad-divider`
- **Elevation** — `--shadow-sm/md/lg/xl` + gold glow `--glow-gold` / `--glow-gold-strong`
- **Radii** — `--r-sm/md/lg/xl/2xl/full`
- **Motion** — `--dur-fast/med/slow`, `--ease-out`, `--ease-in-out`
- **Type** — `--font-display` (Cormorant Garamond), `--font-body` (Inter), tracking scales

A `.force-dark` scope re-declares all dark tokens for pages that must stay immersive regardless of the user's theme (currently the landing hero).

---

## 🗄 Data model

**Chat** — one Q/A pair, indexed on `(userId, sessionId, createdAt)`
```js
{ userId, sessionId, userMessage, botResponse, hindiResponse,
  shloka, translation, chapter, verse, intent, isFavorite, timestamps }
```

**SessionMeta** — per-session metadata, unique `(userId, sessionId)`
```js
{ userId, sessionId, title, autoTitled, timestamps }
```

**Theme** — AI-clustered wisdom themes derived from a user's chats
```js
{ userId, name, description, tags, verses: [{ chapter, verse, shloka,
  translation, explanation, relevance }], timestamps }
```

**User** — Firebase-linked profile
```js
{ email, firebaseUid, displayName, timestamps }
```

**Notification** — scheduled daily-wisdom deliveries
```js
{ userId, quote, sentAt, read, ... }
```

---

## 🔌 API surface

Auth: bearer JWT (`Authorization: Bearer <token>`) — validated by `auth` middleware.

**Chat & sessions**
- `POST /api/message` — `{ message, chatHistory, sessionId }` → persists chat + returns Krishna's response
- `GET /api/chats` — full flat list of user's chats (used to filter by session client-side)
- `PUT /api/chats/:id` — edit user message (regenerates response)
- `DELETE /api/chats/:id` — delete a single chat
- `PUT /api/chats/:id/favorite` — toggle favorite
- `GET /api/conversations` — grouped list `{ sessionId, title, preview, messageCount, lastMessageAt, isLegacy }[]`
- `PATCH /api/conversations/:sessionId` — `{ title }` — rename
- `DELETE /api/conversations/:sessionId` — cascade delete all chats + SessionMeta

**Themes**
- `GET /api/themes[?refresh=true]` — cached (or AI-regenerated)
- `GET /api/themes/:id` — theme details + Krishna's advice
- `GET /api/themes/search/:tag` — tag search (regex-escaped)

**Share / export**
- `GET /api/share/:chatId` — server-formatted share text

**Notifications**
- `GET /api/notifications`, `POST /api/notifications/settings`, etc.

**Auth**
- `POST /api/auth/login`, `POST /api/auth/signup`, `GET /api/auth/me`, `DELETE /api/auth/delete-account`

---

## ⚡ Quick start

Prerequisites: Node 18+, MongoDB running locally, a `.env` in each app.

**Backend**
```bash
cd backend
cp .env.example .env      # fill MONGO_URI, GROQ_API_KEY, JWT_SECRET, FIREBASE_ADMIN_KEY
npm install
npm start                 # nodemon on :5000
```

**Frontend**
```bash
cd frontend
cp .env.example .env      # VITE_APP_API_URL=http://localhost:5000
npm install
npm run dev               # vite on :5173
```

**Android build**
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android      # then Build → Generate APK
```

---

## 🚢 Deploy

- **Frontend** — push to `main` → Vercel auto-deploys. Set `VITE_APP_API_URL` to your Render backend URL.
- **Backend** — Render web service, `npm start` on `:5000`. Set env: `MONGO_URI`, `GROQ_API_KEY`, `JWT_SECRET`, `FIREBASE_ADMIN_KEY` (JSON string), `FIREBASE_PROJECT_ID`.
- **Firebase** — create project → enable Email/Password auth → grab the Admin SDK service account JSON for the backend and the Web SDK config for the frontend (`frontend/src/firebase.js`).

---

## 🗺 Roadmap

Shipped recently:
- ✅ Sessions with proper memory (ChatGPT-style)
- ✅ Auto-titled conversations + rename/delete
- ✅ Shareable image cards + deeplinks
- ✅ Daily shloka card, streak counter, suggestion pills
- ✅ Cached/fallback Explore Themes
- ✅ Full light + dark theme system
- ✅ Copy, page transitions, themed toasts

Ideas that came up during design that are worth building next:
- Ambient audio toggle (temple bell / tanpura loop)
- Route-based code splitting (bundle currently ~1.6MB pre-gzip)
- Per-message bookmarks
- Public shared-answer pages with OG images for viral distribution
- Onboarding tour for first-run users
- Journal reflection input under each response

---

## 📬 Contact

- **Author** — Himanshu Agrawal · `himanshu2005agrawal@gmail.com`
- **Web** — [geeta-gpt14.vercel.app](https://geeta-gpt14.vercel.app/)
- **Issues / feature requests** — open a GitHub issue

---

<p align="center">
  <em>Bridging ancient wisdom with modern technology.</em><br>
  Built with 💻 and 🕉️
</p>
