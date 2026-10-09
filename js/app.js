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

  /* ---------- Intro atmosphere: drifting bokeh + twinkles ---------- */
  function atmosphere() {
    if (reduced) return;
    var box = $('#bokeh'), n = FX.mobile ? 9 : 16;
    for (var i = 0; i < n; i++) {
      var b = el('i'), size = 30 + Math.random() * 120;
      b.style.width = b.style.height = size + 'px';
      b.style.left = (Math.random() * 100 - 10) + '%';
      b.style.top = (Math.random() * 100 - 10) + '%';
      b.style.setProperty('--d', (10 + Math.random() * 12).toFixed(1) + 's');
      b.style.setProperty('--delay', (-Math.random() * 10).toFixed(1) + 's');
      b.style.setProperty('--x', ((Math.random() - .5) * 120).toFixed(0) + 'px');
      b.style.setProperty('--y', ((Math.random() - .5) * 120).toFixed(0) + 'px');
      b.style.setProperty('--o', (.25 + Math.random() * .45).toFixed(2));
      box.appendChild(b);
    }
    FX.sparkleField(FX.mobile ? 34 : 70);
  }

  /* ---------- Hero video ---------- */
  var video = null, userSound = false;
  function heroMedia() {
    var frame = $('#videoFrame');
    if (C.heroVideoRatio) frame.style.setProperty('--ratio', C.heroVideoRatio);
    if (!C.heroVideo) return;

    video = document.createElement('video');
    video.muted = true; video.loop = true; video.playsInline = true;
    video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
    video.preload = 'auto';
    if (C.heroPoster) video.poster = C.heroPoster;
    [[C.heroVideo, 'video/mp4'], [C.heroVideoWebm, 'video/webm']].forEach(function (s) {
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
    btn.addEventListener('click', function () { userSound = true; });

    // Sound plays on the first run only; after that it keeps looping quietly
    var lastT = 0;
    video.addEventListener('timeupdate', function () {
      if (video.currentTime + 1 < lastT && !userSound) video.muted = true;
      lastT = video.currentTime;
    });
    // Pause while the video is scrolled off screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (!document.body.classList.contains('opened')) return;
        if (en[0].isIntersecting) video.play().catch(function () {});
        else video.pause();
      }, { threshold: .2 }).observe(frame);
    }
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
      var r = seal.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      intro.classList.add('press');                                   // seal trembles
      at(260, function () {
        intro.classList.add('opening');                               // seal cracks, ribbon slides away
        FX.burst(cx, cy);
      });
      at(950, function () { intro.classList.add('flap'); });          // flap swings open
      at(1500, function () { intro.classList.add('flap-back', 'card'); }); // card rises
      at(2800, function () { intro.classList.add('zoom'); });         // card comes forward, golden flash
      at(3150, function () {
        intro.classList.add('out');                                   // page appears under the flash
        document.body.classList.remove('locked');
        document.body.classList.add('opened');
        window.scrollTo(0, 0);
        FX.layer(1);
        FX.confettiRain();
        celebrate();
      });
      at(4700, function () { intro.remove(); });
    }
    seal.addEventListener('click', function () { seal.blur(); open(); });
    $('#env').addEventListener('click', function (e) { if (!seal.contains(e.target)) open(); });
    seal.focus({ preventScroll: true });
  }

  /* ---------- Fireworks over the hero while it is on screen ---------- */
  var heroOn = true;
  function celebrate() {
    if (reduced) return;
    [700, 1300, 2100, 2700].forEach(function (d, i) {
      setTimeout(function () { FX.firework(window.innerWidth * (i % 2 ? .75 : .25) + (Math.random() - .5) * 50); }, d);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { heroOn = en[0].isIntersecting; }, { threshold: .35 }).observe($('#home'));
    }
    (function loop() {
      setTimeout(function () { if (heroOn && !document.hidden) FX.firework(); loop(); }, 2600 + Math.random() * 2600);
    })();
  }

  /* ---------- Scroll reveals & active dock item ---------- */
  function reveals() {
    var items = $$('.reveal').filter(function (r) { return !r.closest('.hero'); });
    if (!('IntersectionObserver' in window)) { items.forEach(function (r) { r.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
        if (en.target.id === 'cheers') clink();
        if (en.target.id === 'medallion') finale();
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
      [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60].forEach(function (v, i) {
        var t = pad(v), b = ids[i];
        if (b.textContent === t) return;
        b.textContent = t;
        b.classList.remove('flip'); void b.offsetWidth; b.classList.add('flip');
      });
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
      t.style.transitionDelay = (i * 0.12) + 's';
      t.style.setProperty('--sd', (i * 1.1) + 's');
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
      if (String(n) !== guests.value) { guests.classList.remove('bump'); void guests.offsetWidth; guests.classList.add('bump'); }
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
        if (yes) setTimeout(function () {
          var t = $('.rsvp-done__tick').getBoundingClientRect();
          FX.burst(t.left + t.width / 2, t.top + t.height / 2);
          FX.confettiRain(FX.mobile ? 60 : 110);
        }, 700);
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

  /* ---------- Champagne clink & finale ---------- */
  function clink() {
    setTimeout(function () {
      var g = $('.cheers__glasses').getBoundingClientRect();
      FX.burst(g.left + g.width / 2, g.top + 12, { n: FX.mobile ? 40 : 60, speed: 6, confetti: 0 });
    }, 1300);
  }
  var finaleDone = false;
  function finale() {
    if (finaleDone || reduced) return;
    finaleDone = true;
    [0, 450, 900, 1500].forEach(function (d, i) {
      setTimeout(function () { FX.firework(window.innerWidth * [.3, .7, .5, .2][i], window.innerHeight * (.15 + Math.random() * .2)); }, d);
    });
  }

  /* ---------- Scroll progress + sparkle trail ---------- */
  function extras() {
    var bar = $('#progress'), ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
        ticking = false;
      });
    }, { passive: true });

    if (reduced) return;
    var lastT = 0;
    window.addEventListener('pointermove', function (e) {
      var now = Date.now();
      if (now - lastT < 28) return;
      lastT = now;
      FX.trail(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      var now = Date.now();
      if (now - lastT < 40) return;
      lastT = now;
      FX.trail(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  fill();
  atmosphere();
  extras();
  heroMedia();
  gallery();
  envelope();
  reveals();
  countdown();
  calendar();
  rsvp();
})();
