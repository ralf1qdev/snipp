// Generates random, realistic-looking "screenshots" (fake app UIs) on a canvas for the live demo.
// Everything is drawn locally; no external images are used.
(function () {
  var W = 1200, H = 720;
  var FONT = '"Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
  var MONO = 'Consolas, "Cascadia Code", Menlo, monospace';

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function ri(a, b) { return Math.floor(rnd(a, b + 1)); }
  function pick(arr) { return arr[ri(0, arr.length - 1)]; }
  function shuffle(arr) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = ri(0, i), t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }

  var FIRST = ['Ava', 'Liam', 'Maya', 'Noah', 'Zoe', 'Ethan', 'Mila', 'Leo', 'Iris', 'Omar', 'Nora', 'Kai', 'Lena', 'Ravi', 'Sofia', 'Jonas', 'Elif', 'Theo', 'Hana', 'Diego'];
  var LAST = ['Patel', 'Kim', 'Novak', 'Garcia', 'Okafor', 'Silva', 'Chen', 'Weber', 'Rossi', 'Haddad', 'Larsen', 'Ito', 'Moreau', 'Kowalski', 'Nguyen'];
  var COMPANIES = ['Northwind', 'Lumen', 'Orbital', 'Brightside', 'Cobalt', 'Fernhill', 'Pixelworks', 'Quanta', 'Riverstone', 'Atlas'];
  var HUES = [217, 262, 160, 24, 340, 190];

  function person() { return pick(FIRST) + ' ' + pick(LAST); }
  function email(name, co) { return name.split(' ')[0].toLowerCase() + '@' + co.toLowerCase() + '.io'; }
  function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')'; }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
  }
  function box(c, x, y, w, h, r, fill, stroke) {
    rr(c, x, y, w, h, r);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 1; c.stroke(); }
  }
  function txt(c, s, x, y, size, color, weight, font) {
    c.font = (weight || 400) + ' ' + size + 'px ' + (font || FONT);
    c.fillStyle = color; c.textBaseline = 'alphabetic'; c.fillText(s, x, y);
  }
  function avatar(c, x, y, r, name, hue) {
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = hsl(hue, 60, 55); c.fill();
    var ini = name.split(' ').map(function (p) { return p[0]; }).join('');
    c.font = '600 ' + Math.round(r * 0.8) + 'px ' + FONT; c.fillStyle = '#fff'; c.textAlign = 'center';
    c.fillText(ini, x, y + r * 0.3); c.textAlign = 'left';
  }

  // ---- generators -------------------------------------------------------

  function dashboard(c) {
    var hue = pick(HUES), co = pick(COMPANIES);
    c.fillStyle = '#f4f6fa'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1c2030'; c.fillRect(0, 0, 220, H);
    txt(c, co, 28, 46, 20, '#fff', 700);
    ['Overview', 'Revenue', 'Customers', 'Reports', 'Settings'].forEach(function (s, i) {
      if (i === 0) box(c, 16, 76 + i * 44, 188, 36, 8, hsl(hue, 70, 55, .25));
      txt(c, s, 32, 100 + i * 44, 15, i === 0 ? '#fff' : '#9aa3b8', i === 0 ? 600 : 400);
    });
    txt(c, 'Good morning, ' + pick(FIRST), 252, 52, 24, '#151a28', 700);
    txt(c, 'Here is what happened this week', 252, 78, 14, '#6b7385');
    var labels = ['Revenue', 'New customers', 'Conversion', 'Refunds'];
    var values = [money(rnd(20000, 90000)), ri(300, 2500).toLocaleString('en-US'), rnd(1, 9).toFixed(1) + '%', money(rnd(200, 3000))];
    for (var i = 0; i < 4; i++) {
      var x = 252 + i * 232;
      box(c, x, 104, 216, 104, 12, '#fff', '#e3e7ef');
      txt(c, labels[i], x + 18, 134, 14, '#6b7385');
      txt(c, values[i], x + 18, 172, 28, '#151a28', 700);
      var up = Math.random() > .3;
      txt(c, (up ? '▲ ' : '▼ ') + rnd(1, 24).toFixed(1) + '%', x + 18, 196, 13, up ? '#16a34a' : '#dc2626', 600);
    }
    box(c, 252, 228, 600, 460, 12, '#fff', '#e3e7ef');
    txt(c, 'Monthly revenue', 272, 262, 16, '#151a28', 600);
    var months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], top = ri(6, 11);
    for (var m = 0; m < 12; m++) {
      var bh = m === top ? 330 : rnd(80, 300), bx = 284 + m * 46;
      box(c, bx, 640 - bh, 28, bh, 6, m === top ? hsl(hue, 75, 55) : hsl(hue, 70, 75, .55));
      txt(c, months[m], bx + 9, 668, 13, '#8a91a2');
    }
    box(c, 872, 228, 300, 460, 12, '#fff', '#e3e7ef');
    txt(c, 'Recent customers', 892, 262, 16, '#151a28', 600);
    for (var k = 0; k < 7; k++) {
      var n = person(), y = 300 + k * 56;
      avatar(c, 910, y, 17, n, pick(HUES));
      txt(c, n, 938, y - 2, 14, '#151a28', 600);
      txt(c, email(n, pick(COMPANIES)), 938, y + 16, 12, '#7b8293');
      txt(c, money(rnd(50, 990)), 1110, y + 6, 13, '#151a28', 600);
    }
  }

  function chat(c) {
    var hue = pick(HUES), people = shuffle(FIRST).slice(0, 6).map(function (f) { return f + ' ' + pick(LAST); });
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
    c.fillStyle = hsl(hue, 45, 22); c.fillRect(0, 0, 250, H);
    txt(c, pick(COMPANIES) + ' team', 22, 44, 18, '#fff', 700);
    txt(c, 'CHANNELS', 22, 88, 12, 'rgba(255,255,255,.55)', 600);
    ['general', 'design', 'launch-plan', 'support', 'random'].forEach(function (ch, i) {
      if (i === 2) box(c, 10, 100 + i * 34, 230, 30, 6, 'rgba(255,255,255,.14)');
      txt(c, '# ' + ch, 24, 121 + i * 34, 15, i === 2 ? '#fff' : 'rgba(255,255,255,.72)', i === 2 ? 600 : 400);
    });
    txt(c, 'DIRECT MESSAGES', 22, 312, 12, 'rgba(255,255,255,.55)', 600);
    people.slice(0, 4).forEach(function (p, i) {
      c.beginPath(); c.arc(30, 338 + i * 34, 5, 0, 7); c.fillStyle = i % 2 ? '#9aa' : '#3ddc84'; c.fill();
      txt(c, p, 46, 343 + i * 34, 15, 'rgba(255,255,255,.8)');
    });
    c.fillStyle = '#e8e8ec'; c.fillRect(250, 64, W - 250, 1);
    txt(c, '# launch-plan', 276, 42, 20, '#16161c', 700);
    txt(c, ri(4, 19) + ' members', 430, 41, 13, '#888');
    var msgs = [
      'Launch checklist is ready, can everyone take a look before Friday?',
      'Staging is green. The checkout bug from yesterday is fixed.',
      'Login for the demo account is demo@' + pick(COMPANIES).toLowerCase() + '.io / Spring' + ri(10, 99) + '!',
      'Pushed the new pricing page, copy still needs a review.',
      'Numbers look great: ' + ri(1100, 4800) + ' sign-ups in the beta so far.',
      'Can someone screenshot the error and mark where it happens?'
    ];
    var y = 104;
    shuffle(msgs).slice(0, 6).forEach(function (m, i) {
      var p = people[i % people.length];
      avatar(c, 296, y + 16, 20, p, HUES[i % HUES.length]);
      txt(c, p, 328, y + 10, 15, '#16161c', 700);
      txt(c, ri(9, 11) + ':' + ('0' + ri(0, 59)).slice(-2) + ' AM', 328 + c.measureText(p).width + 50, y + 10, 12, '#999');
      txt(c, m, 328, y + 34, 15, '#2b2b33');
      y += 86;
    });
    box(c, 274, H - 74, W - 300, 50, 10, '#fff', '#cfcfd6');
    txt(c, 'Message #launch-plan', 292, H - 42, 15, '#9a9aa4');
  }

  function code(c) {
    var hue = pick(HUES);
    c.fillStyle = '#1e1e24'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#18181d'; c.fillRect(0, 0, 230, H);
    txt(c, 'EXPLORER', 20, 34, 12, '#8a8a96', 600);
    ['src', '  api', '    checkout.ts', '    users.ts', '  components', '    Cart.tsx', '    Price.tsx', 'tests', 'package.json', 'README.md'].forEach(function (f, i) {
      if (i === 2) { c.fillStyle = '#2a2d3a'; c.fillRect(0, 50 + i * 26, 230, 26); }
      txt(c, f, 20, 68 + i * 26, 14, i === 2 ? '#fff' : '#b8b8c4', 400, MONO);
    });
    c.fillStyle = '#25252c'; c.fillRect(230, 0, W - 230, 40);
    box(c, 230, 0, 170, 40, 0, '#1e1e24');
    txt(c, 'checkout.ts', 252, 26, 14, '#fff', 400, MONO);
    var K = '#c586c0', F = '#dcdcaa', S = '#ce9178', T = '#4ec9b0', D = '#d4d4d4', CM = '#6a9955', N = '#b5cea8', V = '#9cdcfe';
    var lines = [
      [[CM, '// Calculates the order total including tax and discounts']],
      [[K, 'export async function '], [F, 'checkoutTotal'], [D, '(cart: '], [T, 'Cart'], [D, ', region: '], [T, 'string'], [D, ') {']],
      [[K, '  const '], [V, 'subtotal'], [D, ' = cart.items.'], [F, 'reduce'], [D, '((s, i) => s + i.price * i.qty, '], [N, '0'], [D, ');']],
      [[K, '  const '], [V, 'rate'], [D, ' = '], [K, 'await '], [F, 'taxRate'], [D, '(region);']],
      [[K, '  if '], [D, '(cart.coupon) {']],
      [[V, '    subtotal'], [D, ' -= '], [F, 'discount'], [D, '(cart.coupon, subtotal);']],
      [[D, '  }']],
      [[K, '  const '], [V, 'apiKey'], [D, ' = '], [S, '"sk_live_' + Math.random().toString(36).slice(2, 14) + '"'], [D, ';']],
      [[K, '  return '], [F, 'round'], [D, '(subtotal * ('], [N, '1'], [D, ' + rate), '], [N, '2'], [D, ');']],
      [[D, '}']],
      [],
      [[K, 'export function '], [F, 'round'], [D, '(n: '], [T, 'number'], [D, ', d: '], [T, 'number'], [D, ') {']],
      [[K, '  return '], [T, 'Math'], [D, '.'], [F, 'round'], [D, '(n * '], [N, '10'], [D, ' ** d) / '], [N, '10'], [D, ' ** d;']],
      [[D, '}']]
    ];
    lines.forEach(function (parts, i) {
      var y = 76 + i * 26, x = 300;
      txt(c, String(i + 1), 250, y, 14, '#5c5c68', 400, MONO);
      parts.forEach(function (p) { txt(c, p[1], x, y, 15, p[0], 400, MONO); x += c.measureText(p[1]).width; });
    });
    c.fillStyle = '#18181d'; c.fillRect(230, 470, W - 230, H - 470);
    c.fillStyle = '#2e2e36'; c.fillRect(230, 470, W - 230, 1);
    txt(c, 'TERMINAL', 252, 500, 12, '#8a8a96', 600);
    txt(c, '$ npm test', 252, 534, 14, '#d4d4d4', 400, MONO);
    txt(c, ' FAIL  tests/checkout.test.ts', 252, 562, 14, '#f14c4c', 700, MONO);
    txt(c, '  ● checkoutTotal › applies coupon before tax', 252, 590, 14, '#d4d4d4', 400, MONO);
    txt(c, '    Expected: ' + rnd(50, 120).toFixed(2) + '   Received: ' + rnd(50, 120).toFixed(2), 252, 618, 14, '#d4d4d4', 400, MONO);
    txt(c, 'Tests: 1 failed, ' + ri(10, 40) + ' passed', 252, 660, 14, hsl(hue, 60, 65), 400, MONO);
  }

  function inbox(c) {
    var hue = pick(HUES), co = pick(COMPANIES);
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#f2f4f8'; c.fillRect(0, 0, W, 60);
    txt(c, 'Mail', 24, 39, 20, hsl(hue, 70, 45), 700);
    box(c, 220, 14, 520, 34, 17, '#fff', '#d9dde6');
    txt(c, 'Search mail', 242, 36, 14, '#9097a6');
    var subjects = ['Your invoice #' + ri(10000, 99999), 'Re: Q4 roadmap review', 'Password reset requested', 'Lunch on Thursday?', 'Contract draft v' + ri(2, 6), 'Your order has shipped', 'Design feedback round 2', 'Welcome to ' + co + '!'];
    c.fillStyle = '#e6e8ee'; c.fillRect(420, 60, 1, H - 60);
    shuffle(subjects).forEach(function (s, i) {
      var y = 60 + i * 82, n = person();
      if (i === 0) { c.fillStyle = hsl(hue, 80, 96); c.fillRect(0, y, 420, 82); c.fillStyle = hsl(hue, 70, 55); c.fillRect(0, y, 3, 82); }
      txt(c, n, 24, y + 28, 15, '#16161c', i < 3 ? 700 : 400);
      txt(c, s, 24, y + 50, 14, '#33333d', i < 3 ? 600 : 400);
      txt(c, 'Hi, just following up on…', 24, y + 70, 13, '#8a8f9c');
      txt(c, ri(1, 12) + ':' + ('0' + ri(0, 59)).slice(-2), 360, y + 28, 12, '#8a8f9c');
      c.fillStyle = '#eef0f4'; c.fillRect(0, y + 81, 420, 1);
    });
    var from = person();
    txt(c, 'Your invoice #' + ri(10000, 99999), 452, 108, 24, '#16161c', 700);
    avatar(c, 472, 152, 20, from, hue);
    txt(c, from, 504, 148, 15, '#16161c', 700);
    txt(c, email(from, co), 504, 168, 13, '#7c8190');
    var body = ['Hello,', '', 'Thanks for your order. Your payment was processed successfully.', '', 'Amount:          ' + money(rnd(40, 900)) + '.00',
      'Card:               Visa ending in ' + ri(1000, 9999), 'Billing address: ' + ri(10, 999) + ' ' + pick(['Maple', 'Harbor', 'Elm', 'Sunset']) + ' Street', '',
      'You can view and download your invoice from your account page.', '', 'Best regards,', 'The ' + co + ' team'];
    body.forEach(function (l, i) { txt(c, l, 452, 222 + i * 28, 15, '#2b2b33'); });
    box(c, 452, 576, 170, 42, 8, hsl(hue, 70, 52));
    txt(c, 'View invoice', 492, 603, 15, '#fff', 600);
  }

  function checkout(c) {
    var hue = pick(HUES), co = pick(COMPANIES), n = person();
    c.fillStyle = hsl(hue, 30, 97); c.fillRect(0, 0, W, H);
    txt(c, co, 60, 64, 26, '#16161c', 700);
    txt(c, 'Checkout', 60, 128, 32, '#16161c', 700);
    var fields = [['Full name', n], ['Email', email(n, co)], ['Card number', '4' + ri(100, 999) + ' ' + ri(1000, 9999) + ' ' + ri(1000, 9999) + ' ' + ri(1000, 9999)],
      ['Expiry', ('0' + ri(1, 12)).slice(-2) + ' / ' + ri(27, 31)], ['CVC', String(ri(100, 999))], ['Address', ri(10, 999) + ' ' + pick(['Oak', 'River', 'Hill', 'Park']) + ' Avenue']];
    fields.forEach(function (f, i) {
      var half = i === 3 || i === 4, x = 60 + (i === 4 ? 300 : 0), y = 168 + (i > 4 ? 4 : i > 3 ? 3 : i) * 92;
      if (i === 4) y = 168 + 3 * 92;
      if (i === 5) y = 168 + 4 * 92;
      txt(c, f[0], x, y, 14, '#5b6070', 600);
      box(c, x, y + 10, half ? 280 : 580, 48, 8, '#fff', i === 2 ? hsl(hue, 70, 55) : '#d6dae3');
      txt(c, f[1], x + 16, y + 41, 16, '#16161c');
    });
    box(c, 60, 640, 580, 52, 10, hsl(hue, 70, 52));
    var total = rnd(40, 400);
    txt(c, 'Pay ' + money(total) + '.' + ri(10, 99), 290, 673, 17, '#fff', 700);
    box(c, 720, 150, 420, 420, 14, '#fff', '#e3e6ee');
    txt(c, 'Order summary', 748, 192, 18, '#16161c', 700);
    var items = shuffle(['Pro plan (annual)', 'Extra seats × ' + ri(2, 9), 'Priority support', 'Storage add-on', 'Onboarding session']).slice(0, 4);
    items.forEach(function (it, i) {
      box(c, 748, 222 + i * 70, 48, 48, 8, hsl(HUES[i], 60, 90));
      txt(c, it, 812, 252 + i * 70, 15, '#16161c', 600);
      txt(c, money(rnd(9, 199)), 1060, 252 + i * 70, 15, '#16161c');
    });
    c.fillStyle = '#eceef3'; c.fillRect(748, 510, 364, 1);
    txt(c, 'Total', 748, 546, 17, '#16161c', 700);
    txt(c, money(total), 1050, 546, 17, '#16161c', 700);
  }

  var GENERATORS = [dashboard, chat, code, inbox, checkout];
  var NAMES = ['Dashboard', 'Team chat', 'Code editor', 'Email', 'Checkout form'];
  var last = -1;

  window.SnippSamples = {
    names: NAMES,
    // Returns { canvas, name }. Avoids repeating the previous kind.
    generate: function (kind) {
      if (kind == null) { do { kind = ri(0, GENERATORS.length - 1); } while (kind === last && GENERATORS.length > 1); }
      last = kind;
      var cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      GENERATORS[kind](cv.getContext('2d'));
      return { canvas: cv, name: NAMES[kind] };
    }
  };
})();
