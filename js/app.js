(function () {
  'use strict';

  var C = window.EVENT || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TZ = 'Asia/Kuala_Lumpur';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function icon(id) {
    var ns = 'http://www.w3.org/2000/svg';
    var s = document.createElementNS(ns, 'svg');
    var u = document.createElementNS(ns, 'use');
    u.setAttribute('href', '#' + id);
    s.appendChild(u);
    return s;
  }
  function fmt(d, opts) {
    try { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: TZ }, opts)).format(d); }
    catch (e) { return ''; }
  }

  var start = new Date(C.startsAt);
  var end = new Date(C.endsAt || start.getTime() + 4 * 3600e3);
  var venue = C.venue || {};

  /* ---------- Fill content from config ---------- */
  function fill() {
    if (!isNaN(start)) {
      $('#dDay').textContent = fmt(start, { weekday: 'long' });
      $('#dNum').textContent = fmt(start, { day: 'numeric' });
      $('#dMonth').textContent = fmt(start, { month: 'long', year: 'numeric' });
    }
    $('#dTime').textContent = C.timeLabel || '';
    $('#vName').textContent = venue.name || '';
    $('#vAddr').textContent = venue.address || '';
    if (venue.mapsUrl) $('#lnkMaps').href = venue.mapsUrl; else $('#lnkMaps').hidden = true;
    if (venue.wazeUrl) $('#lnkWaze').href = venue.wazeUrl; else $('#lnkWaze').hidden = true;
    $('#rsvpDeadline').textContent = C.rsvpDeadlineLabel || '';
    $('#designedBy').textContent = C.designedBy || '';

    var list = $('#contactList');
    (C.contacts || []).forEach(function (c) {
      var li = el('li');
      var who = el('div', 'contact__who');
      who.appendChild(el('span', 'contact__name', c.name));
      who.appendChild(el('span', 'contact__phone', c.phone));
      li.appendChild(who);
      var num = String(c.phone || '').replace(/[^0-9]/g, '');
      if (num.charAt(0) === '0') num = '6' + num;           // local MY number -> 60…
      var wa = el('a'); wa.href = 'https://wa.me/' + num; wa.target = '_blank'; wa.rel = 'noopener';
      wa.setAttribute('aria-label', 'WhatsApp ' + c.name); wa.appendChild(icon('i-wa'));
      var tel = el('a'); tel.href = 'tel:+' + num;
      tel.setAttribute('aria-label', 'Call ' + c.name); tel.appendChild(icon('i-phone'));
      li.appendChild(wa); li.appendChild(tel);
      list.appendChild(li);
    });
  }

  /* ---------- Gold dust on the intro ---------- */
  function dust() {
    if (reduced) return;
    var box = $('.intro__dust'), n = window.innerWidth < 600 ? 26 : 44;
    for (var i = 0; i < n; i++) {
      var p = el('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.setProperty('--s', (1.5 + Math.random() * 3.5).toFixed(1) + 'px');
      p.style.setProperty('--d', (7 + Math.random() * 9).toFixed(1) + 's');
      p.style.setProperty('--delay', (-Math.random() * 14).toFixed(1) + 's');
      p.style.setProperty('--x', ((Math.random() - .5) * 120).toFixed(0) + 'px');
      p.style.setProperty('--o', (.35 + Math.random() * .6).toFixed(2));
      box.appendChild(p);
    }
  }

  /* ---------- Hero video ---------- */
  var video = null;
  function heroMedia() {
    var frame = $('#videoFrame');
    if (C.heroVideoRatio) frame.style.setProperty('--ratio', C.heroVideoRatio);
    if (!C.heroVideo) return;

    video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    video.preload = 'auto';
    if (C.heroPoster) video.poster = C.heroPoster;
    [[C.heroVideoWebm, 'video/webm'], [C.heroVideo, 'video/mp4']].forEach(function (s) {
      if (!s[0]) return;
      var src = document.createElement('source');
      src.src = s[0]; src.type = s[1];
      video.appendChild(src);
    });
    video.addEventListener('loadeddata', function () { $('#hero50').hidden = true; });
    $('#heroMedia').appendChild(video);

    var btn = $('#btnSound');
    btn.hidden = false;
    function syncBtn() {
      btn.firstElementChild.firstElementChild.setAttribute('href', video.muted ? '#i-mute' : '#i-sound');
      btn.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    }
    btn.addEventListener('click', function () {
      video.muted = !video.muted;
      if (video.paused) video.play().catch(function () {});
      syncBtn();
    });
    video.addEventListener('volumechange', syncBtn);
  }

  // Called inside the tap on the seal, so browsers allow sound.
  function startVideo() {
    if (!video) return;
    try { video.currentTime = 0; } catch (e) {}
    video.muted = false;
    video.play().catch(function () {
      video.muted = true;
      video.play().catch(function () {});
    });
  }

  /* ---------- Envelope opening ---------- */
  function envelope() {
    var intro = $('#intro'), seal = $('#seal'), opened = false;
    var k = reduced ? 0.05 : 1;
    function at(ms, fn) { setTimeout(fn, ms * k); }

    function open() {
      if (opened) return;
      opened = true;
      window.scrollTo(0, 0);
      startVideo();
      intro.classList.add('opening');                        // seal lifts away
      at(320, function () { intro.classList.add('flap'); });        // flap swings open
      at(820, function () { intro.classList.add('flap-back'); });   // flap drops behind the card
      at(900, function () { intro.classList.add('card'); });        // card rises
      at(2350, function () {
        intro.classList.add('out');                          // envelope glides away
        document.body.classList.remove('locked');
        document.body.classList.add('opened');
        window.scrollTo(0, 0);
        $$('.hero .reveal').forEach(function (r) { r.classList.add('in'); });
      });
      at(3500, function () { intro.remove(); });
    }
    seal.addEventListener('click', open);
    // The whole envelope is tappable too
    $('#env').addEventListener('click', function (e) { if (e.target !== seal) open(); });
    seal.focus({ preventScroll: true });
  }

  /* ---------- Scroll reveals & active dock item ---------- */
  function reveals() {
    var items = $$('.reveal').filter(function (r) { return !r.closest('.hero'); });
    if (!('IntersectionObserver' in window)) { items.forEach(function (r) { r.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    items.forEach(function (r) { io.observe(r); });

    var links = $$('.dock a');
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'details', 'gallery', 'rsvp', 'contact'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Countdown ---------- */
  function countdown() {
    if (isNaN(start)) return;
    var box = $('#countdown'), ids = ['cdD', 'cdH', 'cdM', 'cdS'].map(function (i) { return $('#' + i); });
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var ms = start - Date.now();
      if (ms <= 0) {
        box.className = 'countdown done reveal in';
        box.textContent = Date.now() < end ? 'The celebration is happening now ✨' : 'Thank you for celebrating with us ✨';
        return;
      }
      var s = Math.floor(ms / 1000);
      ids[0].textContent = pad(Math.floor(s / 86400));
      ids[1].textContent = pad(Math.floor(s % 86400 / 3600));
      ids[2].textContent = pad(Math.floor(s % 3600 / 60));
      ids[3].textContent = pad(s % 60);
      setTimeout(tick, 1000 - Date.now() % 1000);
    }
    tick();
  }

  /* ---------- Add to calendar (.ics works on iPhone, Android & desktop) ---------- */
  function calendar() {
    $('#btnCal').addEventListener('click', function () {
      function utc(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
      var title = (C.honoreeShort || '') + '’s 50th Birthday Celebration';
      var loc = [venue.name, venue.address].filter(Boolean).join(', ');
      var esc = function (s) { return String(s).replace(/([,;\\])/g, '\\$1'); };
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Emoly Creations//Invitation//EN', 'BEGIN:VEVENT',
        'UID:datosan50-' + utc(start) + '@invitation',
        'DTSTAMP:' + utc(new Date()), 'DTSTART:' + utc(start), 'DTEND:' + utc(end),
        'SUMMARY:' + esc(title), 'LOCATION:' + esc(loc),
        'DESCRIPTION:' + esc(venue.mapsUrl || ''),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(title), 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var a = el('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
      a.download = 'dato-san-50th-birthday.ics';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
  }

  /* ---------- Gallery & lightbox ---------- */
  function gallery() {
    var box = $('#bento'), photos = C.gallery || [], real = [];
    photos.slice(0, 5).forEach(function (p, i) {
      var t;
      if (p.src) {
        var idx = real.length;
        real.push(p);
        t = el('button', 'tile reveal');
        t.type = 'button';
        t.setAttribute('aria-label', 'View photo: ' + (p.alt || 'photo ' + (i + 1)));
        var img = el('img');
        img.src = p.src; img.alt = p.alt || ''; img.loading = 'lazy'; img.decoding = 'async';
        if (p.focus) img.style.objectPosition = p.focus;
        t.appendChild(img);
        t.addEventListener('click', function () { show(idx); });
      } else {
        t = el('div', 'tile tile--empty reveal');
        t.appendChild(icon('i-camera'));
        t.appendChild(el('span', null, 'Photo ' + (i + 1)));
      }
      t.style.transitionDelay = (i * 0.08) + 's';
      box.appendChild(t);
    });

    var lb = $('#lightbox'), img = $('#lbImg'), cur = 0, back = null;
    function show(i) {
      cur = (i + real.length) % real.length;
      img.src = real[cur].src; img.alt = real[cur].alt || '';
      if (lb.hidden) { back = document.activeElement; lb.hidden = false; lockPage(true); $('#lbClose').focus(); }
      var many = real.length > 1;
      $('#lbPrev').hidden = !many; $('#lbNext').hidden = !many;
    }
    function hide() { lb.hidden = true; lockPage(false); if (back) back.focus(); }
    $('#lbClose').addEventListener('click', hide);
    $('#lbPrev').addEventListener('click', function () { show(cur - 1); });
    $('#lbNext').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) hide(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') hide();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 == null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50 && real.length > 1) show(cur + (dx < 0 ? 1 : -1));
    });
  }

  // Freeze the page behind overlays without losing the scroll position (iOS-safe)
  var lockY = 0;
  function lockPage(on) {
    var b = document.body;
    if (on) {
      lockY = window.scrollY;
      b.style.position = 'fixed'; b.style.top = -lockY + 'px'; b.style.left = '0'; b.style.right = '0';
    } else {
      b.style.position = ''; b.style.top = ''; b.style.left = ''; b.style.right = '';
      document.documentElement.style.scrollBehavior = 'auto';
      window.scrollTo(0, lockY);
      document.documentElement.style.scrollBehavior = '';
    }
  }

  /* ---------- RSVP → Google Sheets ---------- */
  function rsvp() {
    var form = $('#rsvpForm'), done = $('#rsvpDone'), err = $('#formError'), btn = $('#btnSubmit');
    var guests = $('#fGuests'), guestField = $('#guestField'), max = C.maxGuests || 6;

    var closes = C.rsvpClosesAt ? new Date(C.rsvpClosesAt) : null;
    if (closes && !isNaN(closes) && Date.now() > closes) {
      form.hidden = true; $('#rsvpClosed').hidden = false;
      return;
    }

    function attendance() { var r = $('input[name="attendance"]:checked', form); return r ? r.value : ''; }
    function setGuests(n) {
      n = Math.min(Math.max(n, 1), max);
      guests.value = n;
      $('[data-step="-1"]', form).disabled = n <= 1;
      $('[data-step="1"]', form).disabled = n >= max;
    }
    setGuests(1);
    $$('.stepper__btn', form).forEach(function (b) {
      b.addEventListener('click', function () { setGuests(Number(guests.value) + Number(b.getAttribute('data-step'))); });
    });
    $$('input[name="attendance"]', form).forEach(function (r) {
      r.addEventListener('change', function () {
        guestField.hidden = attendance() !== 'Attending';
        r.closest('.field').classList.remove('invalid');
        err.textContent = '';
      });
    });
    $$('input, textarea', form).forEach(function (i) {
      i.addEventListener('input', function () { i.closest('.field') && i.closest('.field').classList.remove('invalid'); });
      // Hide the dock while the phone keyboard is up
      i.addEventListener('focus', function () { document.body.classList.add('typing'); });
      i.addEventListener('blur', function () { document.body.classList.remove('typing'); });
    });

    function fail(msg, field) {
      err.textContent = msg;
      if (field) { field.closest('.field').classList.add('invalid'); field.focus(); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      err.textContent = '';
      var data = {
        name: $('#fName').value.trim(),
        phone: $('#fPhone').value.trim(),
        attendance: attendance(),
        guests: attendance() === 'Attending' ? Number(guests.value) || 1 : 0,
        wish: $('#fWish').value.trim(),
        website: form.website.value
      };
      if (!data.name) return fail('Please enter your name.', $('#fName'));
      if (data.phone.replace(/[^0-9]/g, '').length < 8) return fail('Please enter a valid phone number.', $('#fPhone'));
      if (!data.attendance) { $('.choice', form).closest('.field').classList.add('invalid'); return fail('Please let us know if you can attend.'); }

      btn.disabled = true; btn.textContent = 'Sending…';
      send(data).then(function () {
        var yes = data.attendance === 'Attending';
        $('#doneTitle').textContent = 'Thank you, ' + data.name.split(' ')[0] + '!';
        $('#doneMsg').textContent = yes
          ? 'Your RSVP for ' + data.guests + (data.guests > 1 ? ' guests' : ' guest') + ' has been received. We can’t wait to celebrate with you!'
          : 'We’re sorry you can’t make it — thank you for letting us know. You’ll be missed!';
        form.hidden = true; done.hidden = false;
        form.reset(); setGuests(1); guestField.hidden = true;
        done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }).catch(function () {
        fail('Sorry, your RSVP could not be sent. Please check your connection and try again.');
      }).then(function () {
        btn.disabled = false; btn.textContent = 'Send RSVP';
      });
    });

    $('#btnAgain').addEventListener('click', function () { done.hidden = true; form.hidden = false; $('#fName').focus(); });
  }

  function send(data) {
    if (!C.rsvpApiUrl) {
      // Demo mode — no spreadsheet linked yet
      console.info('[RSVP demo] Not sent anywhere. Set rsvpApiUrl in js/config.js.', data);
      return new Promise(function (ok) { setTimeout(ok, 700); });
    }
    // Sent as text/plain so Google Apps Script needs no CORS preflight
    return fetch(C.rsvpApiUrl, { method: 'POST', body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (!j || !j.ok) throw new Error((j && j.error) || 'Server error'); return j; });
  }

  fill();
  dust();
  heroMedia();
  gallery();
  envelope();
  reveals();
  countdown();
  calendar();
  rsvp();
})();
