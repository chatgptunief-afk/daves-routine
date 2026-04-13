# Dave's Recovery Routine App — Implementation Plan

## Overzicht

Een moderne Progressive Web App (PWA) voor persoonlijke planning en herstelroutine met een streak-systeem. Gebouwd met Next.js, Tailwind CSS en lokale opslag (localStorage + IndexedDB voor PWA-persistentie).

## Tech Stack

| Laag | Technologie |
|------|-------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Animaties | Framer Motion |
| Notificaties | Web Notifications API |
| Storage | localStorage (client-side) |
| PWA | next-pwa |
| Deployment | Lokaal via `npm run dev` |

## Projectstructuur

```
dave-app/
├── public/
│   ├── icons/              # PWA icons (192x192, 512x512)
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker (auto-generated)
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout + PWA meta
│   │   ├── page.tsx        # Dashboard (home)
│   │   ├── planning/
│   │   │   └── page.tsx    # Planning overzicht
│   │   ├── streak/
│   │   │   └── page.tsx    # Streak statistieken
│   │   └── globals.css     # Tailwind + custom CSS
│   ├── components/
│   │   ├── ui/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── RoutineSection.tsx
│   │   │   └── NotificationToggle.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Navigation.tsx
│   │   └── Header.tsx
│   ├── hooks/
│   │   ├── useStorage.ts   # localStorage wrapper
│   │   ├── useStreak.ts    # Streak logica
│   │   ├── useTasks.ts     # Task management
│   │   └── useNotifications.ts
│   ├── lib/
│   │   ├── tasks.ts        # Standaard takenlijst
│   │   ├── storage.ts      # Storage utilities
│   │   └── utils.ts        # Helpers
│   └── types/
│       └── index.ts        # TypeScript types
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Kern Features

### 1. Dashboard
- Dagelijkse voortgangsbalk
- Huidige streak met vlam-animatie
- Snelle taakafvinken
- Dag/percentage completion

### 2. Taken systeem
- Ochtendroutine (8 taken)
- Avondroutine (6 taken)
- Dagelijkse taken (vrij instelbaar)
- Automatische reset om middernacht

### 3. Streak Systeem
- Dagelijkse completion tracking
- Streak reset als dag niet volledig voltooid
- Hoogste streak opgeslagen in localStorage
- Vlamanimatie (Framer Motion)

### 4. PWA
- Installeerbaar op iOS/Android/Desktop
- Offline werking via Service Worker
- Push notificaties voor ochternd/avond routine

## Verificatieplan
1. `npm run dev` starten en app testen in browser
2. Lighthouse PWA audit uitvoeren
3. Responsive testen op mobiel/tablet/laptop
