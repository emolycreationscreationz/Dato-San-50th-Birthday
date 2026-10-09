/*
 * Gold effects: twinkling sparkles, confetti bursts and fireworks.
 * Everything is drawn on one full-screen canvas (#fx) in a single loop.
 * Usage: FX.burst(x, y), FX.confettiRain(), FX.firework(x, y), FX.trail(x, y)
 */
(function () {
  'use strict';

  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cv = document.getElementById('fx');        // front layer (over the page)
  var cvB = document.getElementById('fxBack');   // back layer (behind the text)
  var noop = function () {};
  if (!cv || !cvB || !cv.getContext || reduced) {
    window.FX = { burst: noop, confettiRain: noop, firework: noop, trail: noop, sparkleField: noop, layer: noop, mobile: true };
    return;
  }

  var cf = cv.getContext('2d'), cb = cvB.getContext('2d'), ctx = cf;
  var backMode = 0;   // 1 once the page is open: twinkles & fireworks go behind the text
  var W = 0, H = 0, DPR = 1;
  var mobile = Math.min(window.innerWidth, window.innerHeight) < 600;
  var MAX = mobile ? 650 : 1400;
  var GOLDS = ['#fff6d5', '#f7e7a1', '#f3dc8a', '#e8c66a', '#d4af37', '#c9a23a'];
  var CONFETTI = ['#f7e7a1', '#d4af37', '#b8912e', '#fff3c6', '#e8c66a', '#8a6a1f', '#ffffff'];

  var parts = [];      // short-lived particles
  var stars = [];      // ambient twinkles
  var running = false, last = 0, visible = true;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    [cv, cvB].forEach(function (c) {
      c.width = W * DPR; c.height = H * DPR;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      c.getContext('2d').setTransform(DPR, 0, 0, DPR, 0, 0);
    });
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; if (visible) start(); });

  // ---------- ambient twinkling stars ----------
  function sparkleField(n) {
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: rnd(.6, 2.2), ph: Math.random() * Math.PI * 2, sp: rnd(.6, 1.8),
        vy: rnd(-.12, -.03), vx: rnd(-.05, .05)
      });
    }
    start();
  }

  function drawStar(x, y, r, a) {
    ctx.globalAlpha = a;
    ctx.fillStyle = '#fff3c6';
    ctx.beginPath();
    ctx.moveTo(x, y - r * 3); ctx.quadraticCurveTo(x, y, x + r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y + r * 3); ctx.quadraticCurveTo(x, y, x - r * 3, y);
    ctx.quadraticCurveTo(x, y, x, y - r * 3);
    ctx.fill();
    ctx.globalAlpha = a * .35;
    ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, 6.283); ctx.fill();
  }

  // ---------- particle makers ----------
  function add(p) { if (parts.length < MAX) parts.push(p); }

  function spark(x, y, vx, vy, o) {
    o = o || {};
    add({
      t: 'spark', x: x, y: y, vx: vx, vy: vy,
      g: o.g != null ? o.g : .06, f: o.f || .985,
      life: 0, max: o.max || rnd(50, 90), r: o.r || rnd(1, 2.4),
      c: o.c || pick(GOLDS), px: x, py: y, trail: o.trail, twinkle: o.twinkle, L: o.L || 0
    });
  }

  function confetto(x, y, vx, vy) {
    add({
      t: 'conf', x: x, y: y, vx: vx, vy: vy,
      g: .09, f: .985, life: 0, max: rnd(150, 240),
      w: rnd(5, 9), h: rnd(8, 14), rot: rnd(0, 6.28), vr: rnd(-.2, .2),
      flip: rnd(0, 6.28), vf: rnd(.08, .2), c: pick(CONFETTI), sway: rnd(.5, 1.5)
    });
  }

  // Radial burst of sparks + confetti (seal break, RSVP success)
  function burst(x, y, opt) {
    opt = opt || {};
    var n = opt.n || (mobile ? 70 : 120);
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.283, s = rnd(2, opt.speed || 9);
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s - 1.5, { g: .08, max: rnd(40, 80), r: rnd(1, 2.8) });
    }
    var m = opt.confetti != null ? opt.confetti : (mobile ? 40 : 70);
    for (var j = 0; j < m; j++) {
      var b = rnd(-Math.PI, 0), v = rnd(4, 12);
      confetto(x, y, Math.cos(b) * v, Math.sin(b) * v - 2);
    }
    start();
  }

  // Gold confetti falling from the top of the screen
  function confettiRain(n) {
    n = n || (mobile ? 90 : 170);
    for (var i = 0; i < n; i++) {
      (function (d) {
        setTimeout(function () { confetto(Math.random() * W, -20, rnd(-1.5, 1.5), rnd(1, 4)); start(); }, d);
      })(Math.random() * 1600);
    }
  }

  // Rocket that rises and explodes
  function firework(x, y) {
    x = x != null ? x : rnd(W * .15, W * .85);
    y = y != null ? y : rnd(H * .12, H * .4);
    add({ t: 'rocket', x: x + rnd(-30, 30), y: H + 10, tx: x, ty: y, life: 0, max: 999, c: '#fff3c6', L: backMode });
    start();
  }

  function explode(x, y, L) {
    var n = mobile ? 60 : 100, hue = pick([GOLDS, ['#fff6d5', '#f7e7a1', '#ffffff'], ['#e8c66a', '#d4af37', '#b8912e']]);
    var ring = Math.random() < .4;
    for (var i = 0; i < n; i++) {
      var a = (i / n) * 6.283 + rnd(-.05, .05);
      var s = ring ? rnd(4.6, 5.2) : rnd(1, 6);
      spark(x, y, Math.cos(a) * s, Math.sin(a) * s, { g: .045, f: .975, max: rnd(60, 100), r: rnd(1.1, 2.2), c: pick(hue), trail: true, L: L });
    }
    // glitter that crackles a moment later
    for (var k = 0; k < n / 3; k++) {
      var b = Math.random() * 6.283, v = rnd(.5, 3);
      spark(x, y, Math.cos(b) * v, Math.sin(b) * v, { g: .02, f: .96, max: rnd(70, 120), r: rnd(.6, 1.2), c: '#fff6d5', twinkle: true, L: L });
    }
  }

  // Sparkle trail behind a finger / mouse
  function trail(x, y) {
    for (var i = 0; i < 2; i++) spark(x + rnd(-4, 4), y + rnd(-4, 4), rnd(-.6, .6), rnd(-1.2, .2), { g: .03, max: rnd(30, 55), r: rnd(.8, 1.8) });
    start();
  }

  // ---------- loop ----------
  function start() {
    if (running || !visible) return;
    running = true; last = performance.now();
    requestAnimationFrame(frame);
  }

  function frame(now) {
    var dt = Math.min((now - last) / 16.67, 3); last = now;
    cf.clearRect(0, 0, W, H); cb.clearRect(0, 0, W, H);
    cf.globalCompositeOperation = cb.globalCompositeOperation = 'lighter';

    // ambient stars
    ctx = backMode ? cb : cf;
    for (var s = 0; s < stars.length; s++) {
      var st = stars[s];
      st.ph += .03 * st.sp * dt; st.y += st.vy * dt; st.x += st.vx * dt;
      if (st.y < -10) { st.y = H + 10; st.x = Math.random() * W; }
      var a = Math.max(0, Math.sin(st.ph)) * .7;
      if (a > .02) drawStar(st.x, st.y, st.r, a);
    }

    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.life += dt;
      ctx = p.L ? cb : cf;

      if (p.t === 'rocket') {
        p.y += (p.ty - p.y) * .06 * dt - 2 * dt;
        p.x += (p.tx - p.x) * .05 * dt;
        spark(p.x, p.y, rnd(-.3, .3), rnd(.5, 1.5), { g: .02, max: 22, r: rnd(.8, 1.6), c: '#f3dc8a', L: p.L });
        if (p.y <= p.ty + 4) { explode(p.x, p.y, p.L); parts.splice(i, 1); }
        continue;
      }
      if (p.life >= p.max || p.y > H + 40) { parts.splice(i, 1); continue; }

      var k = 1 - p.life / p.max;
      p.px = p.x; p.py = p.y;
      p.vx *= Math.pow(p.f, dt); p.vy = p.vy * Math.pow(p.f, dt) + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;

      if (p.t === 'spark') {
        var al = k * (p.twinkle ? (Math.random() < .5 ? 1 : .2) : 1);
        ctx.globalAlpha = al;
        if (p.trail) {
          ctx.strokeStyle = p.c; ctx.lineWidth = p.r;
          ctx.beginPath(); ctx.moveTo(p.px - p.vx * 2, p.py - p.vy * 2); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.6 + k * .6), 0, 6.283); ctx.fill();
        ctx.globalAlpha = al * .25;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fill();
      } else {
        // confetti: draw normally (not additive) so it reads as metallic paper
        ctx.globalCompositeOperation = 'source-over';
        p.rot += p.vr * dt; p.flip += p.vf * dt;
        p.x += Math.sin(p.life * .05) * p.sway * .3;
        if (p.vy > 2.6) p.vy = 2.6;   // flutter, don't plummet
        ctx.globalAlpha = Math.min(1, k * 2.5);
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.globalAlpha *= .5; ctx.fillStyle = '#fff';
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * .25);
        ctx.restore();
        ctx.globalCompositeOperation = 'lighter';
      }
    }
    cf.globalAlpha = cb.globalAlpha = 1;

    if ((parts.length || stars.length) && visible) requestAnimationFrame(frame);
    else { running = false; cf.clearRect(0, 0, W, H); cb.clearRect(0, 0, W, H); }
  }

  function layer(n) { backMode = n ? 1 : 0; }

  window.FX = { burst: burst, confettiRain: confettiRain, firework: firework, trail: trail, sparkleField: sparkleField, layer: layer, mobile: mobile };
})();
