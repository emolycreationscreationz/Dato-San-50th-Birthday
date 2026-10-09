/**
 * RSVP backend — Dato’ San 50th Birthday
 * ---------------------------------------
 * 1. Create a new Google Sheet > Extensions > Apps Script.
 * 2. Delete the sample code, paste this file, Save.
 * 3. Deploy > New deployment > Type: Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the Web App URL (ends in /exec) into js/config.js -> rsvpApiUrl.
 *
 * Every RSVP is added as one row in the "RSVP" tab.
 * A "Summary" tab shows live totals (attending guests, declines, responses).
 * Wishes appear on the invitation's wishes wall. To hide one, delete its text in the sheet.
 *
 * After changing this code: Deploy > Manage deployments > Edit (pencil) > Version: New version > Deploy.
 * The web app URL stays the same.
 */

var TAB = 'RSVP';
var HEADERS = ['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Birthday Wishes', 'Non-Veg', 'Veg'];

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB, 0);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold').setBackground('#0a0806').setFontColor('#d4af37');
    sh.setColumnWidth(1, 160); sh.setColumnWidth(2, 200); sh.setColumnWidth(3, 140);
    sh.setColumnWidth(4, 130); sh.setColumnWidth(5, 70); sh.setColumnWidth(6, 380);
  }
  // Sheets made before the meal columns existed: add the new headings
  if (sh.getRange(1, 7).getValue() !== 'Non-Veg') {
    sh.getRange(1, 7, 1, 2).setValues([['Non-Veg', 'Veg']])
      .setFontWeight('bold').setBackground('#0a0806').setFontColor('#d4af37');
  }
  summary_(ss);
  return sh;
}

function summary_(ss) {
  var s = ss.getSheetByName('Summary');
  if (s && s.getRange('A5').getValue() === 'Non-vegetarian meals') return;
  if (!s) s = ss.insertSheet('Summary');
  s.getRange('A1:B6').setValues([
    ['Total guests attending', '=SUMIF(RSVP!D:D,"Attending",RSVP!E:E)'],
    ['Responses — attending', '=COUNTIF(RSVP!D:D,"Attending")'],
    ['Responses — not attending', '=COUNTIF(RSVP!D:D,"Not Attending")'],
    ['Total responses', '=COUNTA(RSVP!B:B)-1'],
    ['Non-vegetarian meals', '=SUM(RSVP!G:G)'],
    ['Vegetarian meals', '=SUM(RSVP!H:H)']
  ]);
  s.getRange('A1:A6').setFontWeight('bold');
  s.setColumnWidth(1, 240);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Block formula injection when text starts with = + - @
function clean_(s, max) {
  s = String(s == null ? '' : s).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// Returns the birthday wishes for the wishes wall (newest first). Phone numbers are never sent.
function doGet() {
  var rows = sheet_().getDataRange().getValues().slice(1);
  var wishes = [];
  for (var i = rows.length - 1; i >= 0 && wishes.length < 300; i--) {
    var wish = String(rows[i][5] || '').replace(/^'/, '').trim();
    if (!wish) continue;
    wishes.push({ name: String(rows[i][1] || '').replace(/^'/, '').trim(), wish: wish });
  }
  return json_({ ok: true, service: 'Dato San 50th RSVP', wishes: wishes });
}

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true }); // spam trap filled -> ignore quietly

    var name = clean_(d.name, 80);
    var phone = clean_(d.phone, 20);
    var attendance = d.attendance === 'Attending' || d.attendance === 'Not Attending' ? d.attendance : '';
    if (!name || !attendance) return json_({ ok: false, error: 'Name and attendance are required' });
    var guests = attendance === 'Attending' ? Math.min(Math.max(parseInt(d.guests, 10) || 1, 1), 20) : 0;
    var wish = clean_(d.wish, 400);
    // Meals: vegetarian count, the rest non-vegetarian (always adds up to the guests)
    var veg = attendance === 'Attending' ? Math.min(Math.max(parseInt(d.veg, 10) || 0, 0), guests) : 0;
    var nonVeg = attendance === 'Attending' ? guests - veg : 0;

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Phone stored as text so leading zeros are kept
      sheet_().appendRow([new Date(), name, "'" + phone.replace(/^'/, ''), attendance, guests, wish, nonVeg, veg]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
