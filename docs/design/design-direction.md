# dot air — Design direction: "Full stop"

Status: proposal v4 (Iran network, compact console, Shopify benchmark added). The homepage preview canvas is the visual reference
for this document. When the two disagree, the canvas wins until this file is updated.

## The idea in one line

**نقطه، سر خط. / Full stop. New line.** The old way of booking a flight ends here, and the
brand's own name supplies the symbol: one yellow dot on black.

The dot is the whole identity system. It is the full stop in the headline, the hub on the map,
the assistant's presence indicator, the comet travelling a route, the bullet in the marquee,
the active marker in navigation. If a screen has no dot, it is not finished; if it has more
than one yellow thing competing with the dot, it is overdone.

Tone: serious, exact, a little cold on the surface, with motion that shows the product is alive.
We are not a friendly travel site. We are an airline that was engineered.

## What we take from each reference (and what we leave)

| Reference                          | Take                                                                                                                      | Leave                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| apple.com                          | One idea per viewport, very large type, scroll-linked text and media                                                      | Long scroll-jacked sequences, autoplay video above the fold |
| shopify.design                     | Type scale jumps, marquee, hover states with intent                                                                       | Playful colour, cursor effects                              |
| Qatar Airways / Singapore Airlines | Booking console above the fold with Book / Manage / Check-in / Flight status; sticky trip summary; fare family comparison | Carousel heroes, stacked promo banners, mega-menus          |
| Lufthansa                          | Calm results list, clear fare columns, restrained colour in the funnel                                                    | Small type, low-contrast secondary text                     |

We copy patterns, never artwork, layouts or copy.

## Benchmark (measured October 2026)

Type and colour were set against the reference sites, not by eye. Apple values are read from
apple.com's own stylesheets. Lufthansa and Qatar values come from a third-party token extraction
of their live sites and should be re-checked in a browser. Singapore Airlines and shopify.design
could not be measured from this environment. Shopify values are read from shopify.com's own
brochure stylesheet (type scale, spacing) plus a third-party extraction of the homepage.

|                                 | Display                     | Section headline | Lead    | Body      | Small      | Heaviest weight                                          | Text on ground                                                          |
| ------------------------------- | --------------------------- | ---------------- | ------- | --------- | ---------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| apple.com                       | 80 / 1.05 / -0.015em        | 48 / 1.08        | 21–24   | 17 / 1.47 | 14, nav 12 | 600                                                      | `#f5f5f7` on `#000`, secondary `#a1a1a6` / `#86868b`                    |
| Lufthansa                       | 52 / 1.08                   | 40, 34           | 19      | 16 / 1.5  | —          | 300 for display                                          | `#05164d` on `#fff`, muted `#52627c`                                    |
| Qatar Airways                   | 48 / 1.1                    | 42, 32           | 19      | 16 / 1.5  | —          | 300 for display                                          | `#1f212b` on `#f2f3fa`, muted `#5d5f68`                                 |
| shopify.com (enterprise / plus) | 88 / 96 at ≥1200px, -0.02em | 56 / 64          | 22 / 32 | 18 / 26   | 14 / 20    | 700 on brochure pages; 330–400 on the homepage           | `#fff` on `#000`, muted `#a1a1aa`, card `#02090a` with `#1e2c31` border |
| **dot air v2 (before)**         | 144                         | 68               | 19      | 16        | 11–15      | 900                                                      | `#F4F4F0` on `#070708`                                                  |
| **dot air v4 (now)**            | 84                          | 48               | 21      | 17        | 14, 12     | 400 for display and headlines, 700 for titles and values | `#E9E9E4` on `#111214`                                                  |

What changed because of it:

- The scale went from 19 different sizes to 8, and the display size from 144 to 80.
- Nothing is set heavier than 700 (Persian) or 600 (Latin). None of the references uses a black weight.
- The ground is lifted off black and the text pulled back from white: about 15:1 instead of 18:1
  for primary text, with secondary text near 6.8:1.
- The full yellow block is gone. Yellow is now only the dot, the primary action and the selected state.
- Mobile follows Apple's small breakpoint: display 52, headline 30, lead 21.
- From Shopify: display and section headlines are set light (400), not bold; cards are quiet
  surfaces with a 1px border and an inset top highlight; primary and secondary actions are pills;
  section spacing is 112px (their 80–120); the page gutter is 24px inside a 1200px container.
- From shopify.com/enterprise: the page is a sequence of dense tiles (stats, three-up options,
  product screenshots) rather than photography; the footer has link columns, a locale selector,
  social links and legal links. The homepage now follows that anatomy.
- From shopify.design: a "live" status chip in the hero, a map with city markers, and a hiring
  call near the end. The team tile and the route map take their cue from it.

## Two zones, one theme

The whole site is dark. The zones differ in how much they move and how much they say.

|                         | Showcase                                                             | Funnel                                                      |
| ----------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Routes                  | `/`, `/destinations`, `/offers`, `/experience`, `/loyalty`, `/about` | `/book/*`, `/manage/*`, `/check-in/*`, `/flight-status`     |
| Job                     | Make people believe this airline is different                        | Get them to a confirmed order without doubt                 |
| Type                    | `display` and `headline` allowed                                     | Nothing above `title` (24px); times and prices are the hero |
| Surfaces                | Ink ground, photography, `--surface` panels                          | Ink ground, raised `--surface` cards, no photography        |
| Motion                  | Cinematic, scroll-linked, ambient loops allowed                      | Functional, under 300ms, no loops                           |
| JS budget (gzip, route) | 170 kB                                                               | 130 kB                                                      |

Open decision for the product owner: a light funnel is the safer choice for long forms in bright
environments. If usability testing shows that, only the surface tokens change; nothing else here does.

## Colour

| Token                       | Value                                              | Use                                                                        |
| --------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------- |
| `--ink`                     | `#111214`                                          | Page ground. Not black.                                                    |
| `--surface`                 | `#17181B`                                          | Cards, panels                                                              |
| `--surface-2`               | `#222327`                                          | Raised controls on a surface                                               |
| `--glass`                   | `rgb(24 25 28 / .72)` + `blur(28px) saturate(1.5)` | The booking console and plates over imagery only                           |
| `--line`                    | `rgb(255 255 255 / .10)`                           | Hairlines and field separators                                             |
| `--line-strong`             | `rgb(255 255 255 / .28)`                           | Outlined buttons, focusable borders                                        |
| `--text`                    | `#E9E9E4`                                          | Primary text (about 15:1). Not white.                                      |
| `--text-2`                  | `#BDBDB7`                                          | Navigation, secondary labels                                               |
| `--muted`                   | `#9C9C96`                                          | Body copy on ink (6.8:1)                                                   |
| `--faint`                   | `#85857F`                                          | Field labels, mono captions (5.0:1). Nothing lighter carries text.         |
| `--sun`                     | `#FDB814`                                          | The dot, the primary action, the selected state, one phrase of text on ink |
| `--sun-ring`                | `rgb(253 184 20 / .20)`                            | Hover halo on the primary action, hub glow                                 |
| `--ok` / `--warn` / `--bad` | `#4ADE80` / `#FDB814` / `#FF6B5E`                  | Status on ink; always paired with an icon and words                        |

Rules:

- Yellow never fills a section. Its largest allowed area is the primary action button.
- One primary yellow action per viewport. In the funnel it is the button that moves the booking forward.
- Ink (`--ink`) is the text colour on yellow. White on yellow is never used.
- The only gradients are functional: the hub glow, a scrim that fades a section into the ground,
  and mask fades on the map. No decorative gradient fills, no gradient text.
- Photography is slightly desaturated at rest (`grayscale(.45) brightness(.82)`) and returns to
  full colour on hover or when it is the subject of the viewport.

## Typography

| Voice           | Family                                                                                       | Use                                                                           |
| --------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Persian, Arabic | Alibaba 400 / 700 / 900                                                                      | All fa/ar text. Root size 92% for these locales stays.                        |
| Latin           | Graphik (licensed; files not in the repo yet). Until then **Geist** 400–700 via `next/font`. | All Latin text                                                                |
| Data            | **Geist Mono** 400 / 500, uppercase, +0.08em                                                 | Airport codes, times, coordinates, section indices, keyboard hints, the clock |

The mono voice is what makes the interface feel engineered. It is always Latin, always left to
right, also inside RTL pages (`direction: ltr; unicode-bidi: isolate`).

There are eight sizes. A ninth needs a reason written in this file.

| Token       | Desktop | Mobile | Persian           | Latin (Apple metrics)       | Used for                                       |
| ----------- | ------- | ------ | ----------------- | --------------------------- | ---------------------------------------------- |
| `display`   | 84      | 52     | 400, lh 1.25      | 500, lh 1.05, -0.02em       | Hero headline only                             |
| `headline`  | 48      | 30     | 400, lh 1.3       | 500, lh 1.08, -0.02em       | Section headlines (36 inside half-width tiles) |
| `statement` | 40      | 24     | 400, lh 1.75      | 500, lh 1.25                | The manifesto paragraph                        |
| `title`     | 24      | 21     | 700, lh 1.4       | 600, lh 1.17, +0.009em      | Card titles, plate captions                    |
| `lead`      | 21      | 19     | 400 / 700, lh 1.8 | 400 / 600, lh 1.38          | Hero copy, field values, logo wordmark         |
| `body`      | 17      | 17     | 400, lh 1.9       | 400, lh 1.47                | Copy, inputs, buttons, prices, mono times      |
| `small`     | 14      | 14     | 400 / 700         | 400 / 500                   | Navigation, tabs, links, secondary copy        |
| `caption`   | 12      | 12     | 400               | 400; mono uppercase +0.08em | Field labels, codes, indices                   |

Inputs are never below 17px, so mobile browsers do not zoom on focus.
The outlined footer wordmark is decoration, sized by viewport width, and is not part of the scale.

Never apply negative tracking to Persian or Arabic; it breaks letter joins.

## Shape, space, elevation

- Radii: 10 (primary action), 12 (fields, rows), 20 (console, panels, image cards), 24 (media), 999 (pills, tabs).
- Section rhythm: 112px on desktop, 80px on mobile. Tile grids use a 16px gap. Container 1280px, 24px gutters (12–20 on mobile).
- Separation is done with hairlines and tone, not shadow. Shadows on ink are invisible; the only
  shadow is under the console where it floats over the map.
- Every section opens with the same index row: mono number in yellow, a 48px hairline, a short label.
- Media panels carry corner crop marks (18px, 1px, 80% white).

## Imagery

- The hero image is not a photo. It is a dot-matrix map of the region, generated from land
  geometry, with live route arcs from the market's hub. Each market gets its own hub and framing.
- Photography appears lower on the page, in rounded panels, never full-bleed.
- Text over a photo sits on a glass plate, never directly on the image.
- The logo is never recoloured, rotated or animated. The dot may be.

## Motion

### Tokens

| Token        | Value                          | Use                                         |
| ------------ | ------------------------------ | ------------------------------------------- |
| `--dur-1`    | 150ms                          | Hover, press, toggle                        |
| `--dur-2`    | 250–350ms                      | Tab pill, underline, arrow nudge, popover   |
| `--dur-3`    | 450ms                          | Sheet, step transition, swap rotation       |
| `--dur-4`    | 1100ms                         | Showcase entrances                          |
| `--ease-out` | `cubic-bezier(.16, 1, .3, 1)`  | Everything the user triggers, all entrances |
| `--ease-pop` | `cubic-bezier(.3, 1.4, .5, 1)` | The dot only                                |
| `--spring`   | stiffness 380, damping 32      | Layout animation in Motion                  |

### Showcase patterns (all present in the canvas)

| Pattern                | What happens                                                                                                                      | How                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Hero sequence          | Hub dot pops → headline words rise from a mask → full-stop dot pops → copy and console rise → arcs draw → comets start            | CSS keyframes with delays; one timeline, 2.5s total            |
| Route comets           | A short yellow dash travels each arc from the hub, on a loop                                                                      | `stroke-dasharray` + `stroke-dashoffset` with `pathLength="1"` |
| Hub pulse              | Two rings expand and fade from the hub and from the Ask dot                                                                       | CSS, 2.6s loop                                                 |
| Live clock             | Hub local time ticks in the header and footer                                                                                     | The only JS-driven motion on the page                          |
| Marquee                | Outlined destination names drift between yellow dots                                                                              | CSS transform loop, paused off-screen in production            |
| Scroll progress        | 2px yellow bar across the top                                                                                                     | `animation-timeline: scroll(root)`                             |
| Statement highlight    | Words turn from dim to white as the paragraph passes; the last phrase turns yellow                                                | Named `view-timeline`, one `animation-range` per word          |
| Card stagger           | Cards rise by 40 / 80 / 120 / 160px offsets as the row enters                                                                     | `animation-timeline: view()`                                   |
| Media scale + parallax | Panel scales .88 → 1 with radius 56 → 24; image drifts ±7% inside                                                                 | `view()` timelines                                             |
| Assistant demo         | Sentence types, three dots think, three flights rise, one is marked "Dot's pick"                                                  | One 12s CSS loop; no JS                                        |
| Hovers                 | Underline draws from the reading-start edge; arrows nudge in reading direction; swap icon turns 180°; primary action gains a halo | CSS transitions                                                |

Scroll-linked effects are progressive: where `animation-timeline` is unsupported, content is
simply visible. No IntersectionObserver reveal component.

### Funnel patterns

- **Step change**: View Transitions cross-fade with the trip summary bar as the shared element.
- **Fare expand**: flight card grows with a layout animation; fare columns stagger 30ms.
- **Price change**: digits roll to the new total; the total's background flashes `--sun-ring` once.
- **Selection**: selected fare or seat gets a 1px yellow border that fades in over `--dur-1`, as in the demo.
- **Loading**: content-shaped skeletons; the three bouncing dots are reserved for the assistant.
- **Errors**: no shake. The message fades in and focus moves to it.

### Hard rules

- Animate only `transform`, `opacity`, `clip-path`, `stroke-dashoffset`, `color`.
- Nothing delays input. No animation blocks the next click. No loops in the funnel.
- `prefers-reduced-motion: reduce` → entrances and loops off, everything in its final state, comets hidden.
- Directional motion mirrors in RTL. Geography does not.
- At most one scripted (GSAP) scene per page, lazy-loaded, never above the console. The homepage needs none.

## Signature components

### Booking console

- Glass panel, radius 20, 1px `--line`, floating over the map at the bottom of the first viewport.
  At 1440×900 the search action is fully visible without scrolling.
- Row 1: tabs (Book · Manage · Check-in · Flight status) as text with a light pill on the active
  one; trip type on the opposite edge as quiet outlined pills.
- Row 2: the **Ask** bar. Pulsing dot, one line of natural language, mono `ENTER ↵` hint.
  It fills the form below; the form stays the source of truth and is always editable.
- Row 3: From ⇄ To · Depart · Return · Passengers and cabin · Search. Cells are 84px tall,
  separated by hairlines, each with label / value / mono code or note. The swap button sits on the divider.
- Row 4: promo code, fare calendar, pay with points as text links.
- Mobile: tabs scroll horizontally; cells stack; swap sits on the From/To divider at the end edge;
  Search is full width; a five-item bottom bar (Book, Trips, Check-in, Status, Account) marks the active item with the dot.

### Flight row (as previewed in the assistant demo)

- Mono times with codes beneath, a hairline with a dot at the arrival end, duration in words, price at the end edge.
- The selected or recommended row has a yellow border and a small yellow tag sitting on its top edge.
- The cheapest fare is not highlighted. Yellow marks what the user chose or what the assistant recommends.

### Trip summary bar (funnel)

- Sticky. Route in mono codes, dates, passengers, running total. The total is the same number everywhere on the page.
- Bottom-fixed on mobile with the continue action; respects safe-area insets.

## Accessibility and bidirectionality

- WCAG 2.2 AA. Text at least 4.5:1 (see token notes); controls 44×44px minimum.
- Focus ring: 2px `--sun`, 3px offset, always visible.
- Every component is reviewed in `fa-ir` at 360px before it is done.
- Logical properties only. Arrows, chevrons, underline origins and the typing direction mirror;
  logos, the map, times and codes do not.

## What to remove from the current code

- Cream ground, blurred colour blobs, `.text-shimmer`, `.animate-glow`, `.animate-float`, `ken-burns`.
- The JS `Reveal` and `WordReveal` components.
- The duplicated `home` / `home-v2` features.
- The light theme tokens in `globals.css` (`--color-surface`, brand 50–300 tints).

## v4 addendum: what the homepage is made of

Network. Tehran is the hub. Seven domestic routes (Mashhad, Shiraz, Isfahan, Tabriz, Kish, Ahvaz,
Bandar Abbas) from THR and one international route (Istanbul) from IKA. Durations and prices in
the preview are sample data; distances and bearings are computed from airport coordinates.

Sections, in order: sticky glass nav (56px) → hero with the dot-matrix map of Iran and eight
animated routes → booking console → mono route ticker → eight route tiles → statement →
assistant demo → three product tiles (live status, fare calendar, seat map) → club and team
tiles → footer.

No photography on the homepage. Every visual is drawn from data or from the product itself.

### Booking console (replaces the earlier spec)

- One row at ≥1100px: From ⇄ To · Depart · Return · Passengers · Search. Cells are 68px tall with a
  12px label over a 17px bold value; airport codes sit beside the city in mono.
- Search is a 52px pill sized to its label. It never stretches across a row on desktop or tablet.
- 700–1100px: two rows. Row one is From ⇄ To; row two is dates, passengers and the pill.
- Below 700px: cells stack and the pill becomes full width, which is the expected mobile pattern.
- Tabs scroll horizontally when they do not fit. The Ask field and the three secondary links
  share the bottom row.

### Route tile

- Mono route code, a 64px compass whose yellow dot sits at the true bearing from Tehran, city
  name, duration and distance, "from" price, round arrow button that fills yellow on hover.
- The compass needle swings to its bearing as the tile scrolls into view.
- The international tile carries a yellow hairline border and a small chip.
- Mobile: two columns, compass 44px, duration line and arrow hidden.

### Product tiles

- A 248px stage holding a miniature of the real UI, then a title and one line of copy.
- Live status: a dot travels the route line. Fare calendar: seven bars grow in, the cheapest is
  yellow. Seat map: a dot grid with the chosen seat pulsing.

### Footer

- Brand block with one line of copy and five social links (Instagram, Telegram, X, LinkedIn,
  YouTube) as 40px outlined circles that invert on hover.
- Four link columns: Fly, Destinations, Help, dot air.
- Legal row: copyright, conditions of carriage, privacy, accessibility, sitemap, the live Tehran
  clock and the locale selector.

### Responsive rules

- Breakpoints: 1280 (map shrinks, hero copy narrows), 1100 (console goes to two rows), 1000
  (nav collapses, map moves above the copy, grids go to two columns), 700 (single column, bottom
  navigation appears).
- The mobile artboard is the same page at 390px, not a separate design.

---

## v6 — current direction (supersedes everything above where they differ)

Reference build: the live "dot air Home" page (single HTML prototype) plus its test script (`prototype-v9.test.py`). Port the behaviour and the tests, not the code.

**Principle:** a serious airline first, a modern one second. The first screen is the booking form. Motion supports a task or shows live state; nothing moves only to decorate.

### Benchmarks

| Site                                   | Status                                                                                              | What we take                                                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| apple.com                              | First-party CSS measured                                                                            | Type scale discipline, restraint, one accent                                                                 |
| shopify.com/de/enterprise              | Structure measured                                                                                  | Section rhythm, every section has one live element                                                           |
| lufthansa.com, qatarairways.com        | Third-party extraction                                                                              | Booking widget in the first screen, tabs for book / manage / check-in / status                               |
| singaporeair.com, shopify.design (CSS) | Not measurable from our tooling                                                                     | —                                                                                                            |
| alibaba.ir, azki.com, digikala.com     | Not measurable from our tooling (blocked or client-rendered). Patterns from general knowledge only. | Search box directly under the header, product tabs with icons, one strong primary button, clear card borders |

Before implementation, measure the unmeasured sites in a real browser (Playwright MCP) and correct tokens if needed.

### Page order

1. Header: logo, seven links, language, login. Search pill appears when the form is off-screen.
2. Hero: one-line headline, one-line sub, booking card. Card top ≤ 34% of viewport height; search button inside the first screen at every size.
3. Network: destination list + interactive map + instrument strip (bearing, distance, duration). "Fly to X" fills the form.
4. Assistant: copy + typed demo.
5. Trip tools: flight status, seat map, fare calendar, notifications.
6. Travel guide: six link cards.
7. Club + team.
8. Footer: five columns, six social links, legal row.

Removed in v6: yellow ticker band, scroll-lit manifesto text, custom cursor, magnetic buttons, scroll progress bar, light sections, floating search button.

### Booking card

- Tabs: رزرو پرواز / مدیریت رزرو / پذیرش آنلاین / وضعیت پرواز.
- Fields: origin ⇄ destination, depart, return, passengers & cabin, search button. Destination starts empty.
- Network rule: one end is always Tehran. Non-Tehran origin forces Tehran as destination; Tehran ↔ Istanbul shows IKA.
- Dates: Jalali calendar, two months on desktop, one in a bottom sheet on mobile; range selection; past days disabled; clicking "return" in one-way mode switches to round trip.
- Date value is short («۲۲ مهر»); weekday goes in the label («رفت · چهارشنبه») so the longest value always fits.
- Passengers: adult / child / infant steppers, max 9, infants ≤ adults; cabin economy / business.
- Popovers on desktop, bottom sheets ≤ 700px; Escape closes and returns focus.
- Validation opens the missing field instead of showing a generic error.
- Routes never show prices. Price exists only in search results, from a live response.

### Tokens

`--ink #111214` · `--s1 #17181B` · `--s2 #1D1E22` · `--s3 #282A2F` · `--text #E9E9E4` · `--mute #A9A9A2` · `--faint #8E8E88` · `--line rgba(255,255,255,.12)` · `--line-2 rgba(255,255,255,.22)` · `--sun #FDB814` · `--on-sun #15161A` · `--ok #35C282`.
All dark. Sections alternate `--ink` and `--s1` with a hairline between them. Yellow marks the primary action and the selected state, nothing else.

Type: h1 clamp(30, 4.2vw, 54)/700 · h2 clamp(26, 3vw, 38)/700 · h3 19 · body 16 · field value 17/700 · small 14 · caption 12–13. Radius: card 24, field group 18, button 14, chip 999.

Breakpoints: 1100 (nav collapses, form 3 columns), 900 (form 2 columns, single-column sections), 700 (stacked form, sheets, bottom nav).

### Acceptance tests (run on every change)

Viewports 1440×900, 1280×720, 1024×768, 768×1024, 390×844, 360×740:
no JS errors · no horizontal overflow · search button in the first screen · no clipped text, including longest values («۳۱ اردیبهشت», «بندرعباس BND», «۹ مسافر · اقتصادی») · text contrast ≥ 4.5:1 (≥ 3:1 large) · tap targets ≥ 38px on mobile · every tab, popover, stepper, link and form works · popovers stay inside the viewport · in-page links never navigate · reduced-motion shows all content · page works inside a sandboxed iframe.

---

## v7 addendum — search results, fare families, seat map, English/LTR

Reference build: `docs/design/reference/prototype-v9.html` (home + results in one page, language switch in the header). Tests: `docs/design/prototype-v9.test.py`.

### Benchmarks for the results page

| Site                                | Status                                                  | What we take                                                                                                                                                                       |
| ----------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| singaporeair.com fare types         | First-party page read                                   | Four economy fare types compared on fixed rows: baggage, advance seat selection, miles, cancellation, change. We use the same row logic with three families.                       |
| qatarairways.com fare families      | First-party press release read                          | Classic / Convenience / Comfort in economy, Classic / Comfort / Elite in business; each step adds baggage and flexibility.                                                         |
| lufthansa.com                       | Third-party reports only                                | Light / Classic / Flex naming; next cabin shown beside economy with its price; reviewers criticise that the seat map is only available at the last step. We show it with the fare. |
| The live results pages of all three | Not reachable from our tooling (behind the search flow) | Layout conventions below come from general knowledge of these flows; verify in a real browser before build.                                                                        |

### Page structure

1. Sticky search summary: route, dates, passengers, cabin, "Edit search" (opens the same booking card in place).
2. Step indicator: flights → passengers → extras → payment.
3. Leg tabs (outbound / return) with a tick when chosen.
4. Seven-day date ribbon with the lowest fare per day; lowest day in green; never before today or before the outbound date.
5. Sort (earliest / cheapest) and time-of-day filter; empty state offers to clear the filter.
6. Flight row: times, airports, duration, nonstop, flight number, aircraft, then one price button per cabin ("Economy from", "Business from"), seats-left tag, sold-out state.
7. Opening a cabin shows, inside the row: fare-family cards, then the seat map, then a footer with the running total and "Select this flight".
8. Trip summary: sticky column on desktop, block at the end plus a fixed bottom bar on ≤1100px. Shows pending choice as "not confirmed".

### Fare families (sample conditions — replace with commercial rules)

|             | Light | Classic (recommended) | Flex         | Business | Business Flex (recommended) |
| ----------- | ----- | --------------------- | ------------ | -------- | --------------------------- |
| Cabin bag   | 7 kg  | 7 kg                  | 7 kg         | 2 pieces | 2 pieces                    |
| Checked bag | none  | 20 kg                 | 30 kg        | 40 kg    | 40 kg                       |
| Seat        | fee   | standard included     | any included | included | included                    |
| Date change | fee   | low fee               | free         | fee      | free                        |
| Refund      | no    | fee                   | free         | fee      | free                        |
| Club points | 25%   | 100%                  | 150%         | 200%     | 250%                        |

Each row carries a status: included (green tick), paid (yellow coin), not available (grey cross). Never rely on colour alone; the text states it.

### Seat map on the results page

- Appears as soon as a cabin is opened, under the fare cards, for that exact flight.
- One chip per seated passenger (adults + children); tapping a seat assigns it to the active chip and moves to the next.
- Seat price depends on the chosen fare and updates when the fare changes: legend shows "included" or the fee.
- States: free, extra legroom (blue outline), taken, yours (yellow with passenger number). Exit rows are labelled.
- Optional: skipping it is stated in plain words; a seat is assigned free at check-in.
- Cabin grid always renders left-to-right (A…F), in both languages.

### Direction and language rules

- All layout uses logical properties; the only physical values are inside canvases and the seat grid.
- Mirrored in LTR: arrows, calendar chevrons, back button, progress-bar origin, hero glow side, hero map side, popover alignment.
- Not mirrored: clocks, flight times, airport codes, seat grid, flight-progress line.
- Persian: Jalali calendar, week starts Saturday, Persian digits, Toman. English: Gregorian, week starts Monday, Latin digits, EUR.
- Value fields are sized for the longest string in each language; mobile English uses short tab labels and hides the airport code in the origin/destination pair.
- No `<form>` submit events anywhere in the prototype: a sandboxed frame without `allow-forms` blocks them. In the real app use real forms with server actions.

### Additional acceptance tests

Both languages × six viewports: document direction and logo side · arrow direction · no untranslated text in English · labels do not touch · results open from search · sort and filter · three economy and two business fare cards · seat map present · Flex costs more than Classic · standard seat free on Classic, extra legroom adds a fee · return leg flow · totals match · language switch inside results · edit search in place · one-way search · back to home.

---

## v8 addendum — account, flight details, full seat map

Reference build: `docs/design/reference/prototype-v9.html`. Tests: `docs/design/prototype-v9.test.py`. Nothing from v6/v7 changed in layout; these are additions.

### Account

One dialog (centered on desktop, bottom sheet ≤700px) with five steps:

| Step            | Content                                                                                                      | Rules                                                                                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Entry           | Method switch: one-time code / password. One field: mobile number or email.                                  | Sign-up and log-in are the same flow: an unknown identifier creates an account. Persian and Arabic digits are accepted and normalised.                    |
| Code            | Five single-digit inputs, masked destination, edit link, resend countdown.                                   | First input carries `autocomplete="one-time-code"`; paste and SMS autofill spread across the boxes; auto-submit on the fifth digit; Backspace moves back. |
| First profile   | First name, last name, national ID (Persian locale, optional), the other contact (optional), terms checkbox. | Only names and terms are required.                                                                                                                        |
| Forgot password | Identifier → code → new password.                                                                            | Copy never reveals whether an account exists. After reset the user logs in with the new password.                                                         |
| New password    | Password, repeat, live rule list (8+ characters, one number, match).                                         | Show/hide toggle on every password field.                                                                                                                 |

- Wrong password and unknown account give the same message.
- Focus moves into the dialog, is trapped while it is open, and returns to the opener on close. Escape closes.
- Signed-in header: avatar with initials + first name, opening a menu (profile, trips, log out). On mobile the "Account" tab opens the profile directly.
- Profile page: header with avatar and log out, completion meter with the missing items named, personal details form, sign-in and security (code always on, password set/change), notification switches, saved travellers and trips as empty states.
- Log out returns to home and restores every "log in" entry point.

Production notes: codes are verified server-side with attempt limits and expiry; rate-limit sends; session in an httpOnly cookie; never keep passwords in client state (the prototype does, in memory only, to make the flow testable).

### Flight details (inside each result row)

"Flight details" toggles a panel that stays open alongside fares: a timeline of departure → flight → (stop → flight) → arrival, and a facts grid.

- Each point: local time, city, airport name, IATA code, terminal. Departure adds the check-in deadline and gate note; arrival adds the baggage-belt note.
- Stop: place, duration, and whether passengers change aircraft. The row itself shows "1 stop · city" in yellow with a dot on the line.
- Next-day arrival shows a `+1` marker. International flights state that times are local.
- Facts: date, total travel time, distance, on-board service.
- Durations under an hour read "45 min", never "0 h 45 min".

Terminals, deadlines, the one-stop service and the aircraft type are sample values.

### Seat map

- The whole aircraft is drawn nose-first: front doors, lavatory and galley, business rows, economy rows, over-wing exits at rows 11–12, wings beside rows 9–14, rear lavatories, galley and doors, tail.
- The map opens scrolled to the cabin being bought. Seats in the other cabin are visible but disabled.
- Pointing at, focusing or tapping a seat shows its features in a fixed panel (no floating tooltip): position, pitch, exit-row conditions, no recline, wing view, lavatory proximity, quick exit, power, and the price under the selected fare.
- Rule enforced in the UI: a child cannot be assigned an exit-row seat; the panel explains why.
- Passenger chips are labelled Adult 1, Child 1 …
- Legend adds doors/exits (green) and wing.

### Additional acceptance tests

One-stop flight present on the long domestic routes · details timeline has six entries and names terminal and stop · times never overlap text · details stay open with fares · two wings and eight door markers · map opens at the chosen cabin · seat features on focus · child blocked from exit row, adult allowed · sign-up by code with error state · profile step validation · header shows the user · account menu inside the viewport · profile save validation · set password with live rules · notification switch · log out · wrong password · forgot-password round trip · log in with the new password.

### Lesson recorded from the prototype

Three bugs in this prototype came from global class names colliding (`.line`, `.lg`, `.trip`). The production build must not have global component class names: Tailwind utilities with variants in `packages/ui`, no hand-written global CSS.

---

## v9 addendum — warmth without ornament (home, first screen)

Reference build: `docs/design/reference/prototype-v9.html`. Tests: `docs/design/prototype-v9.test.py`.

**Problem:** the v6–v8 first screen was a form on a near-empty dark field: correct, but cold. **Constraint:** warmth must come from light, colour and tone of voice, never from ornament, heritage motifs or illustration of landmarks. The page stays minimal.

### Benchmarks

| Source                                                                                                           | Status                          | What we take                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Skytrax 2026 top ten (Singapore, Qatar, Cathay Pacific, ANA, Turkish, Emirates, Air France, Hainan, JAL, Korean) | Ranking read from a news report | The reference set for "best airlines".                                                                                                                     |
| Emirates (third-party token extraction, unverified against the live site)                                        | Read                            | "Photography carries the colour; the rest of the page stays grey and white." One warm accent panel per section, flat surfaces, hairlines.                  |
| Riyadh Air brand (PriestmanGoode case study)                                                                     | Read                            | Palette taken from "the ever-changing colours that paint the sky, from dusk till dawn"; lavender, sunset peach, indigo; iridescence instead of decoration. |
| Singapore Airlines home                                                                                          | Partly readable                 | Conversational prompt in the booking module: "Hi, where would you like to go?"                                                                             |
| Qatar Airways home                                                                                               | Read                            | Full-width image hero, aspirational copy, "Pick up where you left off" personalisation.                                                                    |
| Lufthansa home                                                                                                   | Read                            | Photo cards directly under the flight search; no empty band.                                                                                               |

### Rules

1. **One image, and it is light.** The hero is a sky: a smooth colour field, a few long soft strata, and the brand dot as the sun resting on the top edge of the booking card. No drawn clouds, no landmarks, no texture.
2. **Four moods from the real clock in Tehran:** sunrise 05–09, daytime 09–16, sunset 16–20, night otherwise. The page a visitor sees in the morning is not the page they see at night. A small chip names the mood and lets the visitor change it.
3. **Warm side, quiet side.** The glow sits on the side opposite the headline; a shade keeps the copy side dark. Text over the scene must pass contrast against the real pixels in all four moods (tested).
4. **Glass, not paint.** The booking card is translucent with blur so the light shows through; its field group and tab bar stay opaque.
5. **A human sentence.** Greeting by time of day, with the first name when signed in, and one question: "Where shall we go?"
6. **No empty band under the form.** Destination tiles follow immediately: the colour of that place's light, one or two terrain lines, the sun, and the airport code. No architecture, no prices.
7. **Neutrals lean warm.** `--ink #131112` · `--s1 #1A1817` · `--s2 #211E1D` · `--s3 #2E2A28` · `--text #EFEBE4` · `--mute #B4ADA4` · `--faint #99928A`. Added: `--cream #FCF3E3` (text on the scene), `--ember #F7941D`, `--coral #E8674A` (scene and tiles only, never UI chrome).
8. **Motion:** strata drift, the sun breathes by 1.5%, one aircraft crosses with a fading trail about every 45 seconds, layers shift a few pixels with the pointer, tiles lift and their sun rises on hover. All of it stops under `prefers-reduced-motion`.

### For production

- The generated sky and tiles are a stand-in that needs no assets. The benchmark airlines get most of their warmth from photography; if dot air commissions photographs, use them inside the same frames (hero and tiles) with one consistent grade, and keep everything else as is.
- `tokens.css` needs the warm neutral values above before the build starts.

### Additional acceptance tests

Scene is drawn and contains warm colour · greeting, headline, sub-line and tile heading pass contrast against canvas pixels in all four moods · mood chip cycles four moods · eight destination tiles · a tile fills the destination field · greeting uses the first name after sign-in.
