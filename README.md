# Več gostov

Svetla dvojezična spletna stran za studio Mateja Doljaka, ki izdeluje strani za apartmaje in manjše turistične nastanitve. Slovenska različica je na `/`, angleška na `/en/`. Dva jasno označena izmišljena oblikovna primera in vizualna smer sta vključena.

## Lokalni projekt

Node **24.19.0** (pripet v `.nvmrc`), brez zunanjih odvisnosti.

```sh
npm run dev
npm run build
npm run check
```

Predogled: `http://127.0.0.1:4173`. `dev` in `preview` najprej zgradita projekt in strežeta isti statični `dist/`. Po spremembi vsebine izvedi `npm run build` in osveži brskalnik. Lokalni strežnik uveljavlja isti CSP in varnostne glave kot produkcijska konfiguracija.

## Vsebina

- `content/site.json`: vse besedilo, jeziki, paketi, cene, FAQ, kontakt, fotografije in `BRAND_NAME`.
- `contact.email`, `contact.phone`, `contact.whatsapp`: javni kontakti. Telefon z mednarodno predpono; WhatsApp lahko uporablja isto številko. Prazne vrednosti namenoma ne ustvarijo navideznih povezav.
- `domain`: prazno, dokler ni potrjen končni naslov. Nato vnesi izvor z `https://`, brez zaključne poševnice; build ustvari canonical, hreflang, sitemap in absolutne Open Graph URL-je.
- `locales.sl` / `locales.en`: besedilo. Dodaten jezik dodaj kot nov ključ iste strukture; graditelj sam izdela nove poti.
- `images`: fotografije, prevodi alt besedila, izvor, licenca in `replaceable`.
- `src/style.css`: skupni oblikovni tokeni strani in vizualne smeri (`/style-tile/`, `/en/style-tile/`).
- `scripts/build.mjs`: statični graditelj; `src/main.js`: majhen mobilni meni in ohranitev sidra pri preklopu jezika.

Fotografije so shranjene v `assets/` v treh velikostih, WebP in JPEG. Izvirnika sta lokalno v `assets/*-original.jpg` in sta izključena iz gita. Ob menjavi fotografij pripravi enaka razmerja 4:3 in širine 480, 900 ter 1600 px; pomožni `scripts/prepare-images.py` uporablja Pillow.

## Objava

Pripravljen izhod za **Cloudflare Pages Git integration**: produkcijska veja `main`, ukaz `npm run build`, izhod `dist`, Node `24.19.0`. Brez Functions, Workers, GitHub Actions, podatkovne baze ali skrivnosti. CSS, JS in fotografije dobijo vsebinske prstne odtise. `public/_headers` in `_redirects` se kopirata v `dist/`.

Javna objava in končna domena še nista potrjeni. Podrobnosti dejanskih preverjanj in preostalih podatkov so v `PRODUCTION.md`.
