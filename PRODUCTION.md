# Produkcijski zapis

Datum: 22. september 2026. Stran je lokalni, statično zgrajen projekt; javna objava ni bila opravljena.

## Oblikovanje in vsebina

Topel papir, temno zelena tipografija, terakota za glavne gumbe in umirjena modra za spremljajoče poudarke. Ponavljajoč motiv je razglednica. Fotografije so lokalno optimizirane, besedilo pa ostaja HTML. Georgia in Segoe UI/Arial sta sistemski pisavi; ni oddaljenega nalaganja pisav. To je odmik od predloga Google Fonts/self-host v briefu zaradi enostavnosti, hitrosti in delovanja brez zunanjih zahtev.

Vsebina SL/EN je pripravljena. Obe nastanitvi sta izmišljeni in vidno označeni kot demo. Ni izmišljenih rezultatov, ocen ali referenc, sledenja, piškotkov, kontaktnih obrazcev ali plačil.

Manjkajo resnični kontakti, cene, potrditev obsega paketov, DDV, pogoji vzdrževanja, prevodov in rokov. Odgovori FAQ, ki zahtevajo poslovno potrditev, so označeni. Kontaktne povezave so do vnosa podatkov prikazane kot neaktivna mesta; po vnosu build sam pripravi lokalizirani mailto, tel in WhatsApp URL. Ni mogoče preveriti dejanskega odpiranja pošte, telefonije ali WhatsApp brez pravih podatkov in ustreznih aplikacij.

## Fotografije

1. EZcurtain Life: [Cozy living room with neutral tones and natural light](https://unsplash.com/photos/cozy-living-room-with-neutral-tones-and-natural-light-srzKmNLovaQ). Datoteke `assets/interior-*`.
2. Fajar Al Hadi: [Scenic view of Lake Bled and its island](https://unsplash.com/photos/scenic-view-of-lake-bled-and-its-island-NK-GQrcM0Ko). Datoteke `assets/lake-*`.

[Unsplash License](https://unsplash.com/license) dovoljuje brezplačno komercialno uporabo in prilagoditve. Avtorja sta navedena tudi v vsebinski datoteki. Obe fotografiji sta zamenljivi, nista naročnikova projekta. Lokalni preneseni izvirniki so izključeni iz gita; objavijo se samo optimizirane različice.

## Preverjanje

| Področje | Status | Dokaz / omejitev |
| --- | --- | --- |
| Prvi vtis | passed | Znamka, ponudba in glavni gumb na prvem zaslonu; 390 × 844, 768 × 1024, 1440 × 1000. |
| Postavitev | passed | DOM meritve SL/EN pri 1440, 768, 390, 320 in 844 × 390; brez vodoravnega prelivanja. Pregled dolge strani in fotografij v vgrajenem Chromium brskalniku. |
| Jezik | passed | Enaka vsebinska struktura SL/EN; dejanski preklop EN → SL ohrani `#primeri`; demo povezava odpre pravilno stran. |
| Navigacija | passed | Strojno preverjene vse notranje poti in sidra na 9 straneh. Meni se zapre na povezavo in Escape; Escape vrne fokus na gumb. |
| Pravi kontakt | not tested | Resnični podatki niso podani. Mailto/tel/WhatsApp povezave zato še niso aktivne. |
| Dostopnost | passed / delno not tested | En h1 na stran, alt besedila in dimenzije slik, preverjeni glavni kontrasti 5,37–9,62 : 1, vidni fokus ter tipkovnični meni. CSS ima reduced-motion in no-JS možnosti; bralnik zaslona in dejanski JS-disabled/reduced-motion način nista bila emulirana. |
| Lokalna produkcija | passed | Build in check uspeta. 9 HTML strani, noben neveljaven interni vir; lokalno postrežen `dist/`, CSP in cache glave preverjene preko HTTP, zajem konzole brez opozoril/napak. `_headers`, `_redirects`, `404.html` v izhodu. |
| Cloudflare runtime | not tested | Javna objava še ni odobrena; razčlenjevanje Pages pravil še ni preizkušeno na njihovem gostovanju. |
| Prenos | passed / omejeno | Neodvisne lokalne HTTP zahteve brez predpomnilnika in kompresije: začetni nabor **79.693 B (~77,8 KiB)**; celotna stran z obema fotografijama **192.871 B (~188,4 KiB)**. Uporabljeni različici fotografij 900 px; ponovljena notranjost uporablja isti URL. Štejejo telesa odgovorov, brez HTTP glav. To ni meritev browser Resource Timing, Lighthouse ali Core Web Vitals. |

Ponovljivo: `npm run check` ustvari `.qa/static-report.json`; `node scripts/measure.mjs` ob delujočem predogledu ustvari `.qa/transfer-report.json`. Strojno preverjanje ne nadomesti preverjanja na dejanskih telefonih; Safari in Firefox nista preizkušena.

## Gostovanje

Cloudflare račun je dostopen prek povezanega vtičnika. Nov projekt `vecgostov` še ni ustvarjen. Zasebni repozitorij `https://github.com/sixis45/vecgostov` je ustvarjen; prenos vsebine je v pripravi. Lokalni Git postopki so se zaustavljali brez uporabnega sporočila, uporabnik sumi zaščito Malwarebytes. Obstoječi projekt `hidden-soca` ostaja nedotaknjen. Nastavitve pripravljenega projekta: Pages, `main`, `npm run build`, `dist`, `NODE_VERSION=24.19.0`; Git integration je predviden edini tok objave.

Končne domene ni. Relative Open Graph slika uporablja resnično lokalno fotografijo, vendar polna združljivost s socialnimi predogledi zahteva absolutni naslov po potrditvi domene. Graditelj po vnosu `domain` ustvari canonical, hreflang, og:url, sitemap in robots povezavo. `robots.txt` je dotlej dovoljujoč brez izmišljenih absolutnih URL-jev.

Za kasnejšo domeno mora biti poddomena najprej dodana v Pages Custom domains, nato CNAME pri Namecheap usmerjen na dodeljeno `pages.dev` ime. Za korensko domeno Pages zahteva Cloudflare zone/nameservers; alternativno je mogoče uporabiti poddomeno `www` s CNAME in zunanji preusmeritveni servis za korensko domeno. DNS ni bil spreminjan. Analitika je izključena; morebitni vklop Cloudflare Web Analytics zahteva tudi uskladitev strogega CSP.
