# Dato’ San · 50th Birthday Invitation

Digital invitation for the 50th birthday celebration of Dato’ Sandra Sekaran @ Dato’ San.
Theme: rich gold & black. Static site (HTML/CSS/JS), no build step.

## Flow

1. **Envelope intro**: black envelope with gold foil lines and a gold "50" wax seal. Tapping it
   opens the flap, the card rises, and the envelope fades away to reveal the page.
2. **Hero**: name, tagline and a framed **AI video** (an animated gold "50" stands in until the video is added).
3. **Invitation**: the family's message.
4. **The Celebration**: date, time, countdown, venue with Google Maps / Waze, and Add to Calendar (.ics).
5. **Cherished Moments**: 5 photos (one large portrait plus four smaller; tap to enlarge).
6. **RSVP**: name, phone, attending / declining, number of guests, birthday wishes. Saved to Google Sheets.
7. **Contact** and the closing message.

## Structure

```
index.html                  page structure + icons + envelope artwork
css/style.css               design & colours (tokens at the top: --gold, --black, …)
js/config.js                ⭐ ALL DETAILS & SETTINGS — edit this file
js/app.js                   envelope, video, countdown, gallery, RSVP
assets/photos/              gallery photos
assets/video/               hero AI video
assets/og-cover.jpg         preview image when the link is shared on WhatsApp
google-apps-script/Code.gs  RSVP backend (Google Sheets)
```

## Adding the AI video

1. Put the file in `assets/video/` (e.g. `dato-san.mp4`; H.264 MP4 plays everywhere. Keep it under ~15 MB).
2. In `js/config.js` set `heroVideo: "assets/video/dato-san.mp4"`.
3. Set `heroVideoRatio` to match the video: `"16 / 9"` landscape, `"9 / 16"` portrait, `"1 / 1"` square.
4. Optional: `heroPoster` (a still image shown while loading).

The video starts from the beginning the moment the seal is tapped, with sound if the browser allows it.
A sound on/off button sits on the video.

## Adding the 5 photos

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

The form closes automatically after `rsvpClosesAt` (15 Nov 2026, 11:59 PM). To keep it open, set `rsvpClosesAt: ""`.
If you change the Apps Script code, use **Deploy → Manage deployments → Edit → New version** so the same URL keeps working.

## Deploy on Netlify

No build. **Add new site → Import an existing project → GitHub** → choose this repo.
Leave the build command empty; the publish directory `.` is already set in `netlify.toml`.

After you get the domain, change `og:image` in `index.html` to the full URL
(e.g. `https://dato-san-50.netlify.app/assets/og-cover.jpg`) so the preview image shows on WhatsApp.

## Test locally

```
python3 -m http.server 8000
```
Open http://localhost:8000

---
Designed by Emoly Creations
