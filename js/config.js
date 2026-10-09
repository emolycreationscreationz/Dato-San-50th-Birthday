/*
 * ============================================================
 *  INVITATION SETTINGS — edit this file to change the details
 * ============================================================
 *  Date, venue, photos, video, contacts and the RSVP link all
 *  come from here. The design (css/style.css) doesn't need to change.
 */
window.EVENT = {
  // --- Names ---
  honoree: "Dato’ Sandra Sekaran",
  honoreeShort: "Dato’ San",
  monogram: "DS",

  // --- Date & time (Malaysia time, +08:00) ---
  startsAt: "2026-12-28T19:00:00+08:00",   // drives the countdown & date display
  endsAt:   "2026-12-28T23:00:00+08:00",   // used for "Add to Calendar"
  timeLabel: "7.00 PM onwards",

  // --- Venue ---
  venue: {
    name: "Gajaa at 8",
    address: "No. 8, Lorong Maarof, Bangsar Park, 59000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Gajaa+at+8%2C+No.+8+Lorong+Maarof%2C+Bangsar+Park%2C+59000+Kuala+Lumpur",
    wazeUrl: "https://waze.com/ul?q=Gajaa%20at%208%20Lorong%20Maarof%20Bangsar%20Park&navigate=yes"
  },

  // --- Hero video (AI video) ---
  // Put the file in assets/video/ and fill in the path. Empty = animated "50" placeholder.
  heroVideo: "",                 // e.g. "assets/video/dato-san.mp4"
  heroVideoWebm: "",             // optional fallback, e.g. "assets/video/dato-san.webm"
  heroPoster: "",                // optional still shown while the video loads
  heroVideoRatio: "16 / 9",      // "16 / 9" landscape, "9 / 16" portrait, "1 / 1" square

  // --- Gallery (5 photos) ---
  // Put photos in assets/photos/ and fill in src. Empty src = placeholder frame.
  // focus = which part of the photo stays visible when cropped ("x% y%").
  gallery: [
    { src: "", focus: "50% 30%", alt: "Dato’ San" },
    { src: "", focus: "50% 50%", alt: "Cherished memory 2" },
    { src: "", focus: "50% 50%", alt: "Cherished memory 3" },
    { src: "", focus: "50% 50%", alt: "Cherished memory 4" },
    { src: "", focus: "50% 50%", alt: "Cherished memory 5" }
  ],

  // --- Further details (PLACEHOLDER — replace with real name & number) ---
  contacts: [
    { name: "[Contact Name]", phone: "+60 12-345 6789" }
  ],

  // --- RSVP (Google Sheets) ---
  // Paste the Google Apps Script Web App URL (ends in /exec). Empty = demo mode.
  rsvpApiUrl: "",
  rsvpDeadlineLabel: "15th November 2026",
  rsvpClosesAt: "2026-11-15T23:59:59+08:00",   // form closes after this. Empty = never closes.
  maxGuests: 6,

  designedBy: "Emoly Creations"
};
