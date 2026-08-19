# Meldingen — wat werkt nu, en wat een echte achtergrond-push vereist

Dit document hoort bij `components/NotificationScheduler.tsx`, `components/ui/NotificationPrompt.tsx`
en `public/sw.js`.

## Wat er nu werkt

- Toestemming vragen gebeurt nooit meteen bij het openen van de app. Eén keer, rustig, na
  onboarding (`NotificationPrompt.tsx`), of wanneer je zelf "Meldingen" aanzet bij Instellingen.
- Bij Instellingen kun je los aan/uit zetten: Ochtend (met tijd), Ritme, Avond (met tijd), Gebed.
- Zolang de app open is (of onlangs open is geweest — de meeste browsers laten een geopende
  achtergrondtab nog even doortikken), controleert `NotificationScheduler.tsx` elke minuut of er
  op basis van je échte data iets te melden valt:
  - Ochtend/Avond: alleen op de ingestelde tijd, één keer per dag.
  - Ritme: alleen als er ankers zijn ingesteld én er nog eentje openstaat, één keer per dag.
  - Gebed: gebruikt de bestaande gebedstijden-logica (`lib/phase.ts`) — alleen als het gebed nog
    niet is afgevinkt, één keer per gebed per dag.
- Elke categorie is een losse voorkeur; geen categorie ooit "aan" zonder dat jij dat koos.

Dit is een **voorgrond-planner**. Hij vuurt vanuit de geopende pagina/geïnstalleerde app zelf.

## Wat dit niet is

Dit is géén achtergrond-melding die ook binnenkomt als het toestel dicht is en de app al een
tijd niet geopend is. Dat heet Web Push, en vereist een server:

1. Een VAPID-sleutelpaar (publieke sleutel in de client, privésleutel alleen op de server).
2. Een `PushManager.subscribe()`-aanroep in de client die een abonnement oplevert.
3. Opslag van dat abonnement — dit project heeft geen backend/database (alles staat lokaal via
   `idb-keyval`/`localStorage`), dus dit vereist een nieuwe voorziening (bv. Vercel KV, Upstash
   Redis, of een Postgres-tabel).
4. Een geplande taak (bv. een Vercel Cron Job) die op de juiste momenten de opgeslagen
   abonnementen doorloopt en een push verstuurt via het `web-push`-package.

`public/sw.js` heeft al een `push`- en `notificationclick`-handler — die kant is dus klaar.
Zodra er een server is die er iets naartoe stuurt, werkt de rest meteen mee.

Dit is bewust niet nagebouwd met een nep-`setTimeout`-systeem dat net doet alsof het écht is.
Wat hierboven staat werkt vandaag, eerlijk, binnen de grenzen van wat een pure client-app kan.
