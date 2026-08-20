# Meldingen in Dagboog — hoe het werkt, en wat jij nog moet instellen

Dit hoort bij:
- `lib/push/client.ts` — alles wat de browser doet (abonneren, opzeggen, syncen)
- `lib/push/store.ts` — server-opslag van abonnementen (Redis REST, geen extra package)
- `app/api/push/subscribe/route.ts`, `app/api/push/unsubscribe/route.ts`, `app/api/push/send/route.ts`
- `components/NotificationScheduler.tsx` — voorgrond-vangnet + sync
- `components/ui/NotificationPrompt.tsx` — de eenmalige, zachte vraag
- `public/sw.js` — ontvangt en toont de push
- `.github/workflows/push-notifications.yml` — de planning die `/api/push/send` periodiek triggert

## Wat er nu écht werkt

**Zolang de app open is (of onlangs open was):** alles, altijd — het voorgrond-vangnet in
`NotificationScheduler.tsx` heeft geen server nodig.

**Ook wanneer de app/telefoon dicht is:** dit is nu een échte Web Push-implementatie (geen
`setTimeout`-trucje) — VAPID-ondertekende, versleutelde pushberichten via de standaard Push API,
opgeslagen abonnementen server-side, en een periodieke taak die `/api/push/send` triggert. Maar
dit werkt pas zodra jij de onderstaande stappen hebt gedaan — zonder die configuratie valt de app
automatisch en stil terug op het voorgrond-vangnet (nooit een crash, nooit een nepmelding).

**Waarom geen Vercel Cron:** dat was het oorspronkelijke plan (`vercel.json`), maar Vercel's
Hobby-plan staat alleen dagelijkse cron jobs toe — `*/15 * * * *` wordt geweigerd bij deploy
("Hobby accounts are limited to daily cron jobs"). Eén keer per dag is te grof om ochtend-,
avond- en gebedsmeldingen op tijd te laten binnenkomen, dus `/api/push/send` wordt nu in plaats
daarvan periodiek aangeroepen door een GitHub Actions workflow — zie stap 4 hieronder.

### Platformrealiteit — wees hier eerlijk over
- **Android/Chrome (los of als PWA):** Web Push werkt gewoon, in de achtergrond, zodra je
  abonneert.
- **iPhone/Safari:** Web Push bestaat alleen binnen een **op het beginscherm geïnstalleerde**
  PWA, en alleen vanaf **iOS 16.4**. Gewoon in Safari-tabblad? Dan bestaat de Push API niet —
  de app detecteert dit (`lib/push/client.ts`, `pushNeedsHomeScreenInstall()`) en valt terug op
  het voorgrond-vangnet, met een rustige uitleg in de meldingen-sheet.
- **Desktop Safari/oudere browsers:** afhankelijk van ondersteuning; als `PushManager` ontbreekt,
  werkt alleen het voorgrond-vangnet — de app blijft gewoon volledig bruikbaar.

## Wat jij moet instellen om echte achtergrond-push aan te zetten

### 1. VAPID-sleutels genereren
Op je eigen machine (met internet — dit kan niet vanuit deze sessie):
```
npx web-push generate-vapid-keys
```
Dat geeft een `Public Key` en `Private Key`.

### 2. Environment variables (Vercel → Project → Settings → Environment Variables)
| Naam | Waarde | Zichtbaar voor client? |
|---|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | de Public Key hierboven | Ja — moet ook client-side beschikbaar zijn |
| `VAPID_PRIVATE_KEY` | de Private Key hierboven | **Nee — nooit committen, nooit client-side** |
| `VAPID_SUBJECT` | `mailto:jouwemail@voorbeeld.com` | Nee |
| `CRON_SECRET` | een zelfgekozen willekeurige string | Nee — beveiligt `/api/push/send` tegen willekeurige aanroepen |

En voor de opslag van abonnementen — kies één:
- **Vercel KV** (via het Vercel dashboard, Storage-tab, "Create Database" → KV): zet automatisch
  `KV_REST_API_URL` en `KV_REST_API_TOKEN`.
- **Upstash Redis** (rechtstreeks, of via de Vercel Marketplace-integratie): gebruik dan
  `UPSTASH_REDIS_REST_URL` en `UPSTASH_REDIS_REST_TOKEN`. `lib/push/store.ts` accepteert beide
  naamgevingen.

Zonder een van deze twee blijft `/api/push/subscribe` netjes `503 store-not-configured` geven —
de app crasht niet, meldingen vallen terug op het voorgrond-vangnet.

### 3. `npm install`
`package.json` bevat nu `web-push` (server) — deze sessie kon zelf geen `npm install` draaien
(geen registrytoegang in deze sandbox), dus **`package-lock.json` is nog niet bijgewerkt**. Draai
lokaal, vóór je commit/deploy:
```
npm install
```
Dit is niet optioneel — zonder deze stap faalt `npm run build` (en mogelijk Vercel's build, als
die `npm ci` gebruikt en de lockfile niet meer klopt).

### 4. Planning — GitHub Actions in plaats van Vercel Cron
`.github/workflows/push-notifications.yml` roept elke 15 minuten `GET /api/push/send` aan, met
dezelfde `Authorization: Bearer <CRON_SECRET>` header die Vercel Cron zou hebben gebruikt. Zet
'm aan:

1. GitHub → jouw repo → **Settings → Secrets and variables → Actions → New repository secret**:
   naam `CRON_SECRET`, waarde exact dezelfde string als de `CRON_SECRET` die je in Vercel hebt
   gezet (stap 2 hierboven).
2. Optioneel: als je domein ooit afwijkt van `daves-routine.vercel.app`, zet dan ook een
   **repository variable** (zelfde scherm, tab "Variables") genaamd `PUSH_SEND_URL` met de volle
   URL naar `/api/push/send`. Zonder deze variabele gebruikt de workflow de huidige domeinnaam
   als default.
3. Test meteen zonder te wachten: **Actions-tab → "Verstuur pushmeldingen" → Run workflow**
   (dit werkt via de `workflow_dispatch`-trigger in het bestand).

**Wees hier eerlijk over de beperkingen:** GitHub Actions-cron is niet op de minuut nauwkeurig —
bij drukte op GitHub kan een run enkele tot soms tientallen minuten later starten dan gepland.
Voor een ochtend-/avondmelding maakt dat weinig uit, voor gebedstijden is het net zo precies als
de eerstvolgende cron-tick na het tijdstip. Daarnaast schakelt GitHub een scheduled workflow
automatisch uit na **60 dagen zonder enige activiteit** in de repo (geen commits/pushes) — zolang
je actief aan de app blijft werken is dat geen probleem, maar mocht de repo een tijd stilliggen,
check dan de Actions-tab en klik op "Enable workflow" als hij uitstaat. Wil je striktere timing
zonder deze kanttekeningen, dan is een upgrade naar Vercel Pro (met `vercel.json`-crons) of een
externe cron-dienst (bv. cron-job.org, die dezelfde URL + header aanroept) het alternatief.

## Hoe testen
1. Zet alle env vars hierboven in Vercel (en lokaal in `.env.local` voor `npm run dev`).
2. Open de site, zet meldingen aan via de sheet of Instellingen → permissie wordt gevraagd,
   `subscribeToPush()` registreert de service worker en stuurt het abonnement naar
   `/api/push/subscribe`.
3. Roep handmatig `GET https://<jouw-domein>/api/push/send` aan met header
   `Authorization: Bearer <CRON_SECRET>` (of gebruik "Run workflow" in de Actions-tab) — als het
   ochtend-/avondtijdstip al gepasseerd is voor jouw tijdzone, komt de melding binnen, ook met
   de site/app dicht.
4. Check de JSON-respons: `{ ok, checked, sent, skipped, removed }`.

## Opzeggen
- In de app: "Meldingen" uitzetten bij Instellingen roept `unsubscribeFromPush()` aan — dat
  verwijdert het abonnement zowel server-side (`/api/push/unsubscribe`) als browser-side.
- Handmatig: verwijder het veld voor die gebruiker uit de Redis-hash `dagboog:push:subs`, of
  leeg de hele hash als je alles wil resetten.
- Automatisch: als een push een 404/410 teruggeeft (abonnement niet meer geldig aan
  browserzijde — bv. na herinstallatie), verwijdert `/api/push/send` het zelf.

## Bewuste, gedocumenteerde grens
De "Ritme"-melding kent server-side alleen "heeft de gebruiker ankers ingesteld" (gesynchroniseerd
bij elke wijziging), niet "staan er dit moment nog ankers open" — die laatste, preciezere check
gebeurt alleen in het voorgrond-vangnet, omdat de dagelijkse afvinkstatus alleen lokaal op het
toestel leeft. Gebedsmeldingen vuren daarom bewust ook mét een actief pushabonnement nog lokaal
door (naast de server-push) — anders zou een net afgevinkt gebed serverside niet overgeslagen
kunnen worden.

## NEVER
- Nooit `VAPID_PRIVATE_KEY` in git committen of in een `NEXT_PUBLIC_*`-variabele zetten.
- Nooit de inhoud van `.env.local` delen — dat bestand staat (en moet blijven staan) in
  `.gitignore`.
