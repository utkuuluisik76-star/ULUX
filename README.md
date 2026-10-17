# ULUX

Broncode van de ULUX-conceptwebsite: Next.js, React, TypeScript, GSAP en statische export.
Turks op `/`, Engels op `/en/`. Inclusief bladintro, vier petaanzichten en pre-orderaanvraag via e-mail.

## Lokaal starten

Gebruik Node.js 22 en npm. Voer in de projectmap uit:

```sh
npm ci
npm run build
npm start
```

Open daarna http://localhost:4173. Voor ontwikkeling: `npm run dev` (poort 3000).
Op Windows PowerShell kun je `npm.cmd` gebruiken wanneer `npm.ps1` wordt geblokkeerd.

## GitHub

Pak de zip eerst uit. Zet de uitgepakte bestanden in je repository; upload niet alleen het zipbestand.
`package.json`, `package-lock.json`, `src/`, `public/` en de configuratiebestanden horen bij elkaar.

`node_modules/`, `.next/`, `out/`, lokale testresultaten, persoonlijke projectnotities en geheimen
zitten niet in deze export. De `.gitignore` houdt deze ook uit toekomstige commits.

Deze zip maakt of publiceert zelf geen repository en verricht geen commit of push.

## Hosting

Buildopdracht: `npm run build`. De statische website komt in `out/`.
De broncode moet eerst gebouwd worden; GitHub Pages draait niet automatisch een Next.js-build.
Een hostingdienst die de build uitvoert kan `out/` publiceren. Er is nog geen productie-domein
of GitHub Pages-basispad voor deze export ingesteld.

## Inhoud en contact

- Paginacontent: `src/content/ulux.ts`.
- Pagina-opbouw: `src/components/UluxPage.tsx`.
- Vormgeving: `src/app/ulux.css`.
- Bladintro: `src/components/LeafIntro.tsx`.
- Petbediening: `src/components/CapScroll.tsx`.
- Actuele productbeelden: `public/images/cap-v2/`.
- Pre-order en contact: `info@u-luksstudyo.com`.

De pre-orderknoppen openen een ingevulde e-mailaanvraag. Er is geen betaal- of bestelsysteem.
Productbeelden zijn ontwerpvisualisaties; alternatieve aanzichten zijn geen echte turntablefoto's.
Oudere beeldversies blijven als bronmateriaal aanwezig. De site is nog een concept: controleer
voor publicatie domein, metadata, favicon/social-preview en eventuele CMS-placeholders.
