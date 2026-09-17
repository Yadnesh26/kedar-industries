# Kedar Industries — Website

Marketing site for Kedar Industries, built with [Astro](https://astro.build) + Tailwind CSS 4.
See [../implementationplan.md](../implementationplan.md) for the full design/build plan and
[../reference/chandra-electricals-scrape.md](../reference/chandra-electricals-scrape.md) for the
structural reference this was built against.

## Stack

- **Astro 7** (static output) + **Tailwind CSS 4** (CSS-first `@theme` config in `src/styles/global.css`)
- Content collections (`src/content.config.ts`) for the 15 products and 6 capacitor parts —
  each page is generated from one template (`src/pages/products/[slug].astro` /
  `src/pages/capacitor-parts/[slug].astro`)
- All facts live in `src/data/*.json`, extracted from `../KEDAR-INDUSTRIES.md`. Edit those files,
  not the components, when the client sends corrections.
- Images resolved by filename via `src/lib/images.ts` + `astro:assets` — automatic WebP,
  responsive sizing, no manual per-image imports.
- `@fontsource-variable` self-hosted fonts (Manrope, Inter, JetBrains Mono), `@lucide/astro` icons.

## Commands

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```

## Before launch

1. **Contact form**: `src/pages/contact.astro` posts to Web3Forms with a placeholder
   `access_key`. Get a free key at web3forms.com (or swap for the client's preferred provider)
   and replace it before going live.
2. **DNS**: point `kedarindustries.net`'s A/CNAME at the new host. Do **not** touch the MX/SPF/DKIM
   records — email runs on IceWarp and must keep working (see `../private/hosting-credentials.md`,
   gitignored).
3. **Open questions for the client**: see §9 of `../implementationplan.md` — Sinerco-branded
   photo confirmation, factory/team photography, stat figures, remaining client logos, industries
   list, brochure PDF, social links, and CPRI report publishing consent.
4. Rotate the IceWarp admin password referenced in the (gitignored) private credentials file.

## Content model

| File | Holds |
|---|---|
| `src/data/company.json` | Snapshot, contact, hours, mission/vision, registrations |
| `src/data/certifications.json` | ISO/IATF/ZED, Vishay & C&S partnerships, CPRI summary |
| `src/data/cpri-tests.json` | Full CPRI report data — all readings, all three reports |
| `src/data/projects.json` | All 44 delivered projects, tagged by `productType` for the auto-related-projects block on product pages |
| `src/data/clients.json` | Logo wall, vendor/consultant lists, industries |
| `src/data/equipment.json` | 12-instrument testing equipment table |
| `src/data/nav.json` | Header/footer navigation |
| `src/content/products/*.md` | 15 panel products — spec table, features, FAQs |
| `src/content/parts/*.md` | 6 capacitor parts |

## Pages (35 built)

Home · About · Infrastructure · Quality · Certifications (flagship — full CPRI report detail) ·
Products index + 15 product pages · Capacitor Parts index + 6 part pages · Services · Projects
(searchable table of all 44) · Clients · Contact (enquiry form + map) · Privacy Policy · Terms · 404.
