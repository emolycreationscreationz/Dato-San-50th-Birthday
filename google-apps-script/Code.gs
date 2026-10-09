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
 */

var TAB = 'RSVP';
var HEADERS = ['Timestamp', 'Name', 'Phone', 'Attendance', 'Guests', 'Birthday Wishes'];

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
    summary_(ss);
  }
  return sh;
}

function summary_(ss) {
  if (ss.getSheetByName('Summary')) return;
  var s = ss.insertSheet('Summary');
  s.getRange('A1:B4').setValues([
    ['Total guests attending', '=SUMIF(RSVP!D:D,"Attending",RSVP!E:E)'],
    ['Responses — attending', '=COUNTIF(RSVP!D:D,"Attending")'],
    ['Responses — not attending', '=COUNTIF(RSVP!D:D,"Not Attending")'],
    ['Total responses', '=COUNTA(RSVP!B:B)-1']
  ]);
  s.getRange('A1:A4').setFontWeight('bold');
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

function doGet() {
  return json_({ ok: true, service: 'Dato San 50th RSVP' });
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

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      // Phone stored as text so leading zeros are kept
      sheet_().appendRow([new Date(), name, "'" + phone.replace(/^'/, ''), attendance, guests, wish]);
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
