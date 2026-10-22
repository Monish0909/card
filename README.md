# Digital Wedding Invitation (MIWYN sample)

A mobile-first, single-page digital wedding invitation: envelope opener with music, falling petals,
scratch-to-reveal date, live countdown, and flip cards for every wedding event (video, venue, map link, dress code).

Stack: Vite + React + TypeScript + Tailwind CSS (v3). No backend, no database. It builds to static files.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

## Re-branding for a new couple (5 minutes)

Everything the guests read lives in **`src/content.ts`**:

| What | Where in `content.ts` |
| --- | --- |
| Elder who invites, "Cordially invites you" lines | `elder`, `invitationLines` |
| Bride / groom names and parents | `bride`, `groom` |
| Hashtag | `hashtag` |
| Wedding date (drives the countdown) and the text shown on the scratch card | `weddingDateISO` (with `+05:30` offset), `weddingDateFormatted` |
| Mantra | `mantraDevanagari` |
| Events (name, text, date, time, extra lines, venue, address, Google Maps link, dress code, video, style-guide image) | `events[]` (add or remove entries freely) |
| Footer text and credit | `footer` |
| Paths of the shared media files | `assets` |

Also update these two things that live outside `content.ts`:

1. **`index.html`**: `<title>`, `description`, and the Open Graph / Twitter tags (names, date). See "WhatsApp link preview" below.
2. **`public/assets/...`**: replace the placeholder media (see the table below). Keep the same file names, or change the paths in `content.ts`.

Tips:
- `mapsUrl: "#"` makes the button open a Google Maps *search* for the venue and address. Paste the real share link from Google Maps for the final site.
- The countdown shows a "Celebrated with love" message automatically once the wedding date has passed.

## Media files to supply (`public/assets/`)

The repo ships with **placeholders** so the site runs immediately. Replace them with the client's real media.

| File | What it is | Recommended spec |
| --- | --- | --- |
| `videos/envelope-open.mp4` | Optional real envelope clip, plays once after the tap and replaces the built-in animation | Portrait or square, 5-8 s, H.264, no audio, under 3 MB. **Placeholder is an empty file on purpose**: the built-in CSS envelope animation plays instead. |
| `audio/theme-song.mp3` | Background music (looped, starts on the tap, mute button included) | MP3 96-128 kbps, under 4 MB. **Placeholder is a generated 64 s Indian-classical-style instrumental (tanpura drone + sitar-like melody), royalty-free.** Replace with the couple's chosen licensed song. |
| `images/ganpati-gold.svg` | Ganpati logo above the mantra | Transparent PNG/SVG, gold |
| `images/bg-watercolor.svg` | Page background wash | JPG/WebP about 1200x2400, under 300 KB |
| `videos/event-*.mp4` (4 files) | Looping clip on the front of each event card | **Vertical 9:16**, 720x1280, 6-12 s loop, H.264, no audio, under 3 MB each |
| `images/style-*.svg` (4 files) | Dress-code image on the back of each event card | **Vertical 9:16** (cropped to fill), JPG/WebP, under 400 KB each |
| `images/og-image.png` | Preview picture for WhatsApp / social links | PNG or JPG **1200x630** |

Compress a video for the web (works for the event clips and the envelope clip):

```bash
ffmpeg -i input.mov -vf "scale=720:-2" -c:v libx264 -profile:v main -crf 28 -preset slow -an -movflags +faststart output.mp4
```

Compress music:

```bash
ffmpeg -i song.wav -c:a libmp3lame -b:a 96k theme-song.mp3
```

Use H.264 MP4 (not VP9/WebM): it is the format that plays on every iPhone and Android phone.

## WhatsApp link preview (do this after deploying)

WhatsApp and most crawlers need an **absolute https URL** and a **PNG/JPG** image. In `index.html`, replace every
`https://your-domain.example` with the real domain, for example `https://aanya-weds-veer.vercel.app`.
WhatsApp caches previews, so test with a fresh link or add `?v=2` to the shared URL after changes.

## Deploy

Any static host works. Build command `npm run build`, output folder `dist`.

- **Vercel / Netlify**: import the repo (or drag the `dist` folder into Netlify Drop). No settings needed beyond the two above.
- Add a custom domain in the host's dashboard if the client wants one.

## How the experience works

1. **Opener**: a large embossed envelope with a wax seal (initials come from the names in `content.ts`). Tap the button
   (music starts, browsers need a tap): the seal breaks, the flap swings open, the card slides out, the camera zooms
   into the card, then the invitation fades in with a gentle settle. The whole thing is CSS (`.env-*` in `index.css`).
   If a real `envelope-open.mp4` loads, it plays instead, followed by the same zoom. Safety timers guarantee the opener
   always ends; reduced-motion users get a plain fade.
2. **Invitation**: staggered fade-up text, petals, mute/unmute button (bottom right).
3. **Scratch card**: scratch with a finger or mouse (about half the foil reveals the date). A visible "Reveal date" button
   does the same for keyboard and screen-reader users.
4. **Countdown** to `weddingDateISO`.
5. **Events**: each card plays its video only while on screen. "Style Guide" flips the card (3D) to the dress code;
   "Go back" flips it again. The card height does not jump during the flip.
6. **Footer** with the regards line and credit.

Accessibility and performance: pinch-zoom is allowed, page content is inert behind the opener, flip faces are
focusable only when visible, `prefers-reduced-motion` turns off petals, flip animation and video autoplay, and event
videos load only metadata until they are on screen.

## Project structure

```
src/
  content.ts            all client-specific text and event data (edit this)
  types.ts              TypeScript shape of the content
  App.tsx               page layout and audio control
  index.css             animations (petals, sparkles, entrances, flip helpers)
  hooks/useInView.ts    scroll visibility (entrance animation, video play/pause)
  components/
    Opener.tsx          envelope overlay, video + CSS fallback animation
    AudioPlayer.tsx     floating mute button
    FallingPetals.tsx   petal layer
    ScratchCard.tsx     canvas scratch-to-reveal
    Countdown.tsx       live countdown
    EventsSection.tsx   section heading and list of event cards
    EventCard.tsx       flip card with video, venue, map link, style guide
    Footer.tsx          closing lines and credit
public/assets/          images, videos, audio
```

## Notes

- Fonts load from Google Fonts (Dancing Script, Marcellus SC, Noto Serif Devanagari). They need an internet connection.
- All names, venues, and dates in the repo are **fictional sample content**. No images, videos, audio, or text were copied from any other website.
