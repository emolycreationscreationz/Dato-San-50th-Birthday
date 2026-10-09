# Dato’ San · 50th Birthday Invitation

Digital invitation for the 50th birthday celebration of Dato’ Sandra Sekaran @ Dato’ San.
Theme: rich gold & black. Static site (HTML/CSS/JS), no build step.

## Flow

1. **Envelope intro**: black velvet with an art-deco gold frame, fan ornaments, light rays, bokeh and twinkling stars.
   A black envelope tied with a glittering gold satin ribbon floats in; a gold wax seal with ribbon tails
   stamps onto it and light sweeps across the foil. Tapping the seal cracks it in two with a burst of gold,
   the ribbon slides away, the flap opens to reveal a gold-glitter lining, the gold-edged card rises
   and comes forward in a golden flash, and the page appears under falling confetti.
2. **Hero**: a grand art-deco gold arch draws itself, "Dato’ San" writes itself in embossed gold foil,
   and gold fireworks burst behind the text. The **AI video** sits below in a bevelled gold picture frame
   (an animated gold "50" stands in until it's added).
3. **Gold ribbon** scrolling "Fifty Years · Life · Love · Laughter · Achievements · Cherished Memories".
4. **Invitation** in an art-deco panel whose corners draw in, plus two champagne flutes that clink with a sparkle.
5. **The Celebration**: date in a spinning gold ring, flip-style countdown, venue card with a travelling-light border,
   Google Maps / Waze and Add to Calendar (.ics).
6. **Cherished Moments**: 5 photos (one large portrait plus four smaller) that tilt in, with light sweeps; tap to enlarge.
7. **RSVP** card with a travelling-light border; a successful "Joyfully Accept" bursts into gold confetti. Saved to Google Sheets.
8. **Contact**, then the closing with a spinning "50" medallion and a final round of fireworks.

Gold sparkles follow the finger or mouse. Everything respects the phone's "Reduce Motion" setting.

## Structure

```
index.html                  page structure + icons + envelope artwork
css/style.css               design & colours (tokens at the top: --gold, --black, …)
js/config.js                ⭐ ALL DETAILS & SETTINGS — edit this file
js/app.js                   envelope, video, countdown, gallery, RSVP
js/fx.js                    gold sparkles, confetti & fireworks (canvas)
assets/photos/              gallery photos
assets/video/               hero AI video
assets/og-cover.jpg         preview image when the link is shared on WhatsApp
google-apps-script/Code.gs  RSVP backend (Google Sheets)
```

## The AI video

Current video: `assets/video/dato-san.mp4` (1280×720, 10 s, no audio) plus `dato-san.webm` as a fallback copy,
and `dato-san-poster.jpg` shown while it loads. It starts from the beginning when the seal is tapped,
loops silently, and pauses when scrolled off screen.

To replace it:

1. Put the file in `assets/video/` (e.g. `dato-san.mp4`; H.264 MP4 plays everywhere. Keep it under ~15 MB).
2. In `js/config.js` set `heroVideo: "assets/video/dato-san.mp4"`.
3. Set `heroVideoRatio` to match the video: `"16 / 9"` landscape, `"9 / 16"` portrait, `"1 / 1"` square.
4. Optional: `heroPoster` (a still image shown while loading).

The video plays silently (its audio track was removed).

## Background music

`assets/music/jailer-2-theme.mp3` (set as `music` in `js/config.js`). It starts from the beginning when the seal
is tapped, loops, and pauses while the browser tab is in the background. There are no music buttons.
To change the song, replace the file (or the path in `music`); set `music: ""` to turn it off.

## The 5 photos

Current photos: `assets/photos/dato-san-1.webp` … `dato-san-5.webp`.

Put them in `assets/photos/` (`.webp` or `.jpg`, about 1600px on the long side) and fill in `gallery` in `js/config.js`.
Photo 1 is the large portrait (best as a portrait shot of Dato’ San).
`focus` controls which part stays visible when a photo is cropped (e.g. `"50% 30%"` keeps the upper part).

## Contact details

Replace the placeholder in `contacts` in `js/config.js`. You can add more than one:
```js
contacts: [
  { name: "Priya", phone: "+60 12-345 6789" },
  { name: "Kumar", phone: "011-2345 6789" }
]
```
WhatsApp and Call buttons are created automatically.

## RSVP → Google Sheets

1. Create a new Google Sheet.
2. **Extensions → Apps Script**, paste the contents of `google-apps-script/Code.gs`, Save.
3. **Deploy → New deployment → Web app**. Execute as: *Me*. Who has access: *Anyone*. Authorise.
4. Copy the `/exec` URL into `js/config.js` → `rsvpApiUrl`.

Each response becomes a row in the **RSVP** tab (Timestamp, Name, Phone, Attendance, Guests, Birthday Wishes).
A **Summary** tab shows total guests attending and response counts.

While `rsvpApiUrl` is empty the site runs in **demo mode**: the form works but nothing is saved.

**Wishes wall**: the birthday wishes guests type in the RSVP form appear in a scrolling "Birthday Wishes"
box under the RSVP form (newest first, name + wish; phone numbers are never shown). It checks for new
wishes every 30 seconds while the invitation is open. To hide a wish,
delete its text in the sheet's "Birthday Wishes" column.

The form closes automatically after `rsvpClosesAt` (15 Nov 2026, 11:59 PM). To keep it open, set `rsvpClosesAt: ""`.
If you change the Apps Script code, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

## Deploy on Netlify

No build. **Add new site → Import an existing project → GitHub** → choose this repo.
Leave the build command empty; the publish directory `.` is already set in `netlify.toml`.

Live site: https://datosan50-emolycreations.netlify.app — `og:image` in `index.html` already points there
so the preview image shows on WhatsApp. If the address changes, update `og:image` and `og:url`.

## Test locally

```
python3 -m http.server 8000
```
Open http://localhost:8000

---
Designed by Emoly Creations
