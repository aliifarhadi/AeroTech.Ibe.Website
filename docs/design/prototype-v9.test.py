"""Acceptance tests for the dot air prototype: home + search results, Persian (RTL) and English (LTR).
Usage: python3 test.py [fa|en|all|extra] [WxH ...]   (expects wrapped.html next to this file)"""
import asyncio, os, html, sys
from playwright.async_api import async_playwright

URL = 'file://' + os.path.abspath('wrapped.html')
ALL_VPS = [(1440, 900), (1280, 720), (1024, 768), (768, 1024), (390, 844), (360, 740)]
args = sys.argv[1:]
LANGS = [] if args[:1] == ['extra'] else ['fa', 'en'] if not args or args[0] == 'all' else [args[0]]
VPS = [tuple(map(int, a.split('x'))) for a in args[1:]] or ALL_VPS
fails = []

T = {
    'fa': dict(shiraz='شیراز', mashhad='مشهد', tehran='تهران', kish='کیش', istanbul='استانبول', enter='وارد کنید', preview='پیش‌نمایش', add='افزودن', choose='انتخاب', pax3='۳ مسافر', biz='بیزینس', cur='تومان', cont='ادامه به مسافران', notsel='هنوز انتخاب نشده', dir='rtl', otpbad='نادرست', created='ساخته شد', saved='ذخیره شد', pwset='تنظیم شده', login='ورود', out='خارج شدید', exitmsg='کودکان', term='ترمینال', stop='توقف', window='پنجره', notvalid='معتبر', accept='بپذیرید', wrong='نادرست', match='یکسان'),
    'en': dict(shiraz='Shiraz', mashhad='Mashhad', tehran='Tehran', kish='Kish', istanbul='Istanbul', enter='Enter', preview='preview', add='Add', choose='Choose', pax3='3 passengers', biz='Business', cur='€', cont='Continue to passengers', notsel='Not selected yet', dir='ltr', otpbad='not right', created='is ready', saved='saved', pwset='Set', login='Log in', out='logged out', exitmsg='Children', term='erminal', stop='top', window='Window', notvalid='valid', accept='accept', wrong='not right', match='match'),
}

AUDIT = r'''
() => {
  const out = { overflow: document.documentElement.scrollWidth - innerWidth, clipped: [], small: [], contrast: [], persian: [] };
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const lum = (c) => { const a = c.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return [0, 0, 0, 0]; const p = m[1].split(/[, /]+/).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const bgOf = (e) => { let layers = []; for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } } let base = [17, 18, 20]; for (let i = layers.length - 1; i >= 0; i--) { const c = layers[i]; base = [0, 1, 2].map((k) => c[k] * c[3] + base[k] * (1 - c[3])); } return base; };
  const opac = (e) => { let o = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) o *= +getComputedStyle(n).opacity; return o; };
  const label = (e) => (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal === undefined ? e.className : '').trim().split(/\s+/).join('.') + ' "' + (e.textContent || '').trim().slice(0, 28) + '"';
  const en = document.documentElement.lang === 'en';
  for (const e of document.querySelectorAll('body *')) {
    if (!vis(e) || e.closest('svg') || e.closest('[aria-hidden=true]') || e.closest('.notes') || e.closest('#toast') || e.closest('.skel')) continue;
    const s = getComputedStyle(e);
    const own = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent).join(' ');
    if (own) {
      if (e.scrollWidth > e.clientWidth + 1 && s.overflowX !== 'visible' && !e.closest('.list') && !e.closest('.rs-q') && !e.closest('.leg') && !e.closest('.sumbar')) out.clipped.push(label(e));
      if (en && /[؀-ۿ]/.test(own) && !e.closest('[data-lang]')) out.persian.push(label(e));
      if (opac(e) > .95 && !e.disabled && !e.closest(':disabled')) {
        const fg = parse(s.color), bg = bgOf(e); const f = [0, 1, 2].map((k) => fg[k] * fg[3] + bg[k] * (1 - fg[3]));
        const L1 = lum(f), L2 = lum(bg), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
        const px = parseFloat(s.fontSize), big = px >= 24 || (px >= 18.6 && +s.fontWeight >= 700);
        if (cr < (big ? 3 : 4.5)) out.contrast.push(cr.toFixed(2) + ' ' + px + 'px ' + label(e));
      }
    }
    if (e.matches('a,button,input') && !e.closest('.pop') && !e.closest('.chk')) { const r = e.getBoundingClientRect(); if (r.height < (innerWidth <= 700 ? 38 : 30) && !e.closest('.fc,.legal')) out.small.push(Math.round(r.height) + 'px ' + label(e)); }
  }
  for (const k of ['contrast', 'clipped', 'small', 'persian']) out[k] = [...new Set(out[k])];
  return out;
}
'''

def check(cond, msg):
    if not cond:
        fails.append(msg); print('  FAIL', msg)

async def audit(pg, tag, where, lang):
    a = await pg.evaluate(AUDIT)
    check(a['overflow'] <= 0, f'{tag}: {where}: horizontal overflow {a["overflow"]}px')
    check(not a['clipped'], f'{tag}: {where}: clipped text {a["clipped"]}')
    check(not a['small'], f'{tag}: {where}: small targets {a["small"]}')
    check(not a['contrast'], f'{tag}: {where}: low contrast {a["contrast"]}')
    if lang == 'en': check(not a['persian'], f'{tag}: {where}: untranslated text {a["persian"]}')

async def run(p, w, h, lang):
    tag = f'{lang} {w}x{h}'; t = T[lang]
    print('==', tag)
    mobile = w <= 700
    b = await p.chromium.launch()
    c = await b.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
    pg = await c.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(1500)
    ev = pg.evaluate
    txt = lambda sel: pg.inner_text(sel)
    if lang == 'en':
        await ev("document.querySelector('[data-lang]').click()"); await pg.wait_for_timeout(500)
    check(await ev("document.documentElement.dir") == t['dir'], f'{tag}: document direction')
    side = await ev("(() => { const r = document.querySelector('.brand').getBoundingClientRect(); return (r.left + r.right) / 2 < innerWidth / 2 ? 'left' : 'right'; })()")
    check(side == ('left' if lang == 'en' else 'right'), f'{tag}: logo on the {side}')
    arrow = await ev("new DOMMatrix(getComputedStyle(document.querySelector('#go svg.arr')).transform).a")
    check((arrow < 0) == (lang == 'en'), f'{tag}: search arrow points the wrong way')

    # ---------- home ----------
    m = await ev('''() => { const c = document.querySelector('#card').getBoundingClientRect(), g = document.querySelector('#go').getBoundingClientRect(), s = document.querySelector('.sub').getBoundingClientRect(); return { cardTop: c.top, ctaBottom: g.bottom, subBottom: s.bottom }; }''')
    usable = h - (64 if mobile else 0)
    print(f"  home: card top {m['cardTop']:.0f}px, search button bottom {m['ctaBottom']:.0f}px of {usable}px usable")
    check(m['ctaBottom'] <= usable, f'{tag}: search button below the first screen ({m["ctaBottom"]:.0f} > {usable})')
    check(m['cardTop'] <= h * .36, f'{tag}: card starts too low ({m["cardTop"]:.0f})')
    check(m['subBottom'] <= m['cardTop'] + 1, f'{tag}: hero text overlaps card')
    longest = {'fa': ['۳۱ اردیبهشت', 'افزودن برگشت', '۹ مسافر · اقتصادی', 'بندرعباس'], 'en': ['30 Sep', 'Choose date', '9 passengers · Business', 'Bandar Abbas']}[lang]
    fit = await ev('''(v) => { const out = []; for (const [id, s] of [['#f-dep', v[0]], ['#f-ret', v[1]], ['#f-pax', v[2]], ['#f-to', '<span>' + v[3] + '</span><span class="mono">BND</span>']]) { const e = document.querySelector(id), old = e.innerHTML, ph = e.classList.contains('ph'); e.classList.remove('ph'); e.innerHTML = s; if (e.scrollWidth > e.clientWidth + 1) out.push(id + ' ' + e.scrollWidth + '>' + e.clientWidth); e.innerHTML = old; e.classList.toggle('ph', ph); } return out; }''', longest)
    check(not fit, f'{tag}: longest values do not fit {fit}')
    await audit(pg, tag, 'home top', lang)
    # hero scene: drawn, and text stays readable over the real canvas pixels in all four moods
    moods = set()
    for _ in range(4):
        moods.add((await txt('#mood-t')).split(' · ')[0])
        sc = await ev('''() => { const c = document.querySelector('#hmap'), g = c.getContext('2d'), cb = c.getBoundingClientRect(), D = c.width / cb.width;
          const lum = (c) => { const a = c.map((v) => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
          const out = {};
          for (const sel of ['#hello-t', 'h1 span', '.sub span', '.insp-h h2 span']) { const el = document.querySelector(sel), rg = document.createRange(); rg.selectNodeContents(el); const r = rg.getBoundingClientRect(), fg = getComputedStyle(el).color.match(/[0-9.]+/g).slice(0, 3).map(Number), L1 = lum(fg), v = [];
            for (let i = 0; i <= 10; i++) for (let j = 0; j <= 2; j++) { const p = g.getImageData(Math.round((r.left + r.width * i / 10 - cb.left) * D), Math.round((r.top + r.height * j / 2 - cb.top) * D), 1, 1).data, L2 = lum([p[0], p[1], p[2]]); v.push((Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05)); }
            v.sort((a, b) => a - b); out[sel] = +v[2].toFixed(2); }
          const d = g.getImageData(0, 0, c.width, Math.min(c.height, 400)).data; let warm = 0; for (let i = 0; i < d.length; i += 4 * 97) if (d[i] > d[i + 2] + 30 && d[i] > 120) warm++;
          out.warm = warm; return out; }''')
        check(sc['#hello-t'] >= 4.5 and sc['h1 span'] >= 3 and sc['.sub span'] >= 4.5 and sc['.insp-h h2 span'] >= 3, f'{tag}: hero text contrast over the scene ({await txt("#mood-t")}): {sc}')
        check(sc['warm'] > 20, f'{tag}: hero scene has no warm colour ({sc["warm"]})')
        await pg.click('#mood'); await pg.wait_for_timeout(350)
    check(len(moods) == 4, f'{tag}: mood chip should cycle four moods {moods}')
    check(await ev("document.querySelectorAll('#cards .dc .dc-art svg').length") == 8, f'{tag}: destination cards')
    await ev("document.querySelectorAll('#cards .dc')[1].click()"); await pg.wait_for_timeout(300)
    check(t['shiraz'] in await txt('#f-to'), f'{tag}: destination card should fill the form')
    await ev("document.querySelector('.insp').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
    await audit(pg, tag, 'destination cards', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-cards.png')
    await ev('scrollTo(0,0)'); await pg.wait_for_timeout(300)
    await pg.screenshot(path=f'shots/{lang}-{w}-hero.png')
    await ev("document.querySelector('[data-pop=to]').click()"); await pg.wait_for_timeout(150); await pg.keyboard.press('Escape')
    gaps = await ev('''() => { const out = []; for (const sel of ['.tab span', '.links a span', '.mnav a span', '.flow li span']) { const r = [...document.querySelectorAll(sel)].map((e) => e.getBoundingClientRect()).filter((x) => x.width > 0).sort((a, b) => a.left - b.left); for (let i = 1; i < r.length; i++) if (Math.abs(r[i].top - r[i - 1].top) < 8 && r[i].left - r[i - 1].right < 6) out.push(sel + ' gap ' + Math.round(r[i].left - r[i - 1].right)); } return out; }''')
    check(not gaps, f'{tag}: labels touch each other {gaps}')

    for tb in ['manage', 'checkin', 'status', 'book']:
        await pg.click(f'.tab[data-tab={tb}]'); await pg.wait_for_timeout(100)
        check(await ev(f"!document.querySelector('.panel[data-panel={tb}]').hidden && document.querySelectorAll('.panel:not([hidden])').length === 1"), f'{tag}: tab {tb}')
    await pg.click('.tab[data-tab=manage]'); await pg.click('.panel[data-panel=manage] .cta')
    check(t['enter'] in await txt('.panel[data-panel=manage] .msg'), f'{tag}: manage empty validation')
    await pg.fill('#m1', 'ABC123'); await pg.click('.panel[data-panel=manage] .cta')
    check(t['preview'] in await txt('.panel[data-panel=manage] .msg'), f'{tag}: manage submit')
    await pg.click('.tab[data-tab=book]')

    async def pop_ok(name):
        r = await ev('''() => { const p = document.querySelector('.pop'); if (!p) return null; const r = p.getBoundingClientRect(); return { l: r.left, r: r.right, w: innerWidth }; }''')
        check(r is not None, f'{tag}: {name} popover did not open')
        if r:
            check(r['l'] >= -0.5 and r['r'] <= r['w'] + .5, f'{tag}: {name} popover off-screen horizontally {r}')
            await pg.wait_for_timeout(450)
            r2 = await ev('''() => { const r = document.querySelector('.pop').getBoundingClientRect(); return { t: r.top, b: r.bottom, h: innerHeight }; }''')
            check(r2['b'] <= r2['h'] + 1 or r2['b'] - r2['t'] > r2['h'] - 150, f'{tag}: {name} popover cut at the bottom {r2}')
            a2 = await ev(AUDIT)
            check(a2['overflow'] <= 0, f'{tag}: overflow with {name} popover')
            if lang == 'en': check(not a2['persian'], f'{tag}: {name} popover untranslated {a2["persian"]}')

    async def days():
        return await ev("[...document.querySelectorAll('.pop .day:not(:disabled)')].filter(d => d.offsetParent).map(d => d.dataset.t)")

    await pg.click('[data-pop=to]'); await pg.wait_for_timeout(250); await pop_ok('destination')
    await pg.fill('.pop .aq', t['shiraz'][:3]); await pg.wait_for_timeout(80)
    check(await ev("document.querySelectorAll('.pop .ao').length") == 1, f'{tag}: airport filter')
    await pg.click('.pop .ao'); await pg.wait_for_timeout(200)
    check(t['shiraz'] in await txt('#f-to'), f'{tag}: destination not set')
    await pg.click('[data-pop=from]'); await pg.wait_for_timeout(200); await pop_ok('origin')
    await pg.click('.pop .ao[data-c=MHD]'); await pg.wait_for_timeout(200)
    check(t['mashhad'] in await txt('#f-from') and t['tehran'] in await txt('#f-to'), f'{tag}: origin rule')
    await pg.click('#swap'); await pg.wait_for_timeout(100)
    check(t['tehran'] in await txt('#f-from') and t['mashhad'] in await txt('#f-to'), f'{tag}: swap')
    await pg.click('[data-pop=dep]'); await pg.wait_for_timeout(250); await pop_ok('calendar')
    d = await days()
    await pg.click(f'.pop .day[data-t="{d[min(9, len(d) - 2)]}"]'); await pg.wait_for_timeout(150)
    await pg.click(f'.pop .day[data-t="{d[min(13, len(d) - 1)]}"]'); await pg.wait_for_timeout(500)
    if mobile:
        check(await ev("!!document.querySelector('.pop')"), f'{tag}: sheet should stay until confirmed')
        await pg.click('.pop .pop-f [data-close]'); await pg.wait_for_timeout(150)
    check(await ev("!document.querySelector('.pop')"), f'{tag}: calendar did not close')
    dep, ret = await txt('#f-dep'), await txt('#f-ret')
    check(dep and ret and dep != ret and t['choose'] not in ret, f'{tag}: dates {dep} / {ret}')
    await pg.click('[data-pop=dep]'); await pg.wait_for_timeout(200)
    t1 = await txt('.pop .mo b'); await pg.click('.pop [data-cal="1"]'); t2 = await txt('.pop .mo b')
    check(t1 != t2, f'{tag}: month navigation'); await pg.keyboard.press('Escape'); await pg.wait_for_timeout(100)
    check(await ev("!document.querySelector('.pop')"), f'{tag}: Escape did not close popover')
    await pg.click('#tripseg [data-trip=one]'); check(t['add'] in await txt('#f-ret'), f'{tag}: one-way label')
    await pg.click('[data-pop=ret]'); await pg.wait_for_timeout(200)
    check(await ev("document.querySelector('#tripseg [data-trip=round]').getAttribute('aria-pressed')") == 'true', f'{tag}: return click should switch to round trip')
    d2 = await days()
    await pg.click(f'.pop .day[data-t="{d2[min(16, len(d2) - 1)]}"]'); await pg.wait_for_timeout(450)
    if await ev("!!document.querySelector('.pop')"): await pg.click('.pop .pop-f [data-close]')
    await pg.click('[data-pop=pax]'); await pg.wait_for_timeout(200); await pop_ok('passengers')
    await pg.click('.pop [data-px=ad][data-d="1"]'); await pg.click('.pop [data-px=inf][data-d="1"]'); await pg.click('.pop [data-cab=C]'); await pg.click('.pop .pop-f [data-close]')
    check(t['pax3'] in await txt('#f-pax') and t['biz'] in await txt('#f-pax'), f'{tag}: passengers ' + await txt('#f-pax'))
    await pg.click('#promo-b'); await pg.wait_for_timeout(500); await pg.fill('#promo-i', 'dot20'); await pg.click('#promo-go')
    check('DOT20' in await txt('#promo-o'), f'{tag}: promo')
    await audit(pg, tag, 'home form filled', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-home.png')

    # every in-page link, then menu
    n = await ev("document.querySelectorAll('a[href^=\"#\"]').length"); href0 = pg.url
    for i in range(n):
        if await ev(f"(() => {{ const a = document.querySelectorAll('a[href^=\"#\"]')[{i}], r = a.getBoundingClientRect(), s = getComputedStyle(a); return r.width > 0 && s.visibility !== 'hidden' && !a.closest('[hidden]'); }})()"):
            await ev(f"document.querySelectorAll('a[href^=\"#\"]')[{i}].click()")
    await pg.wait_for_timeout(300)
    check(pg.url == href0, f'{tag}: a link navigated the page to {pg.url}')
    await ev("document.querySelector('.tab[data-tab=book]').click()")
    if w <= 1100:
        await ev('scrollTo(0,0)'); await pg.wait_for_timeout(600)
        await pg.click('#burger'); check(await ev("!document.querySelector('#menu').hidden"), f'{tag}: menu did not open')
        await audit(pg, tag, 'menu', lang)
        await pg.click('#menu a[href="#routes"]'); await pg.wait_for_timeout(900)
        check(await ev("document.querySelector('#menu').hidden"), f'{tag}: menu did not close')
    # network
    await ev("document.querySelector('#routes').scrollIntoView()"); await pg.wait_for_timeout(900)
    await pg.click('.r[data-i="4"]'); await pg.wait_for_timeout(500)
    check(t['kish'] in await txt('#rname'), f'{tag}: list pick')
    await ev('''() => { const cv = document.querySelector('#nmap'), b = cv.getBoundingClientRect(); const sc = Math.min(b.width / (b.width < 520 ? 1010 : 900), b.height / 610), x = b.width / 2 - 545 * sc + 162.6 * sc, y = b.height / 2 - 318 * sc + 12 + 78.1 * sc; cv.dispatchEvent(new MouseEvent('click', { clientX: b.left + x, clientY: b.top + y, bubbles: true })); }''')
    await pg.wait_for_timeout(500)
    check(t['istanbul'] in await txt('#rname'), f'{tag}: map click picked ' + await txt('#rname'))
    await audit(pg, tag, 'network', lang)
    await pg.click('#rgo'); await pg.wait_for_timeout(1100)
    check(t['istanbul'] in await txt('#f-to') and 'IKA' in await ev("document.querySelector('#f-from').textContent"), f'{tag}: route CTA should fill destination')
    # assistant, seats, rest of home
    await ev("document.querySelector('#assistant').scrollIntoView()"); await pg.wait_for_timeout(500)
    await pg.click('.chip[data-i="1"]'); await pg.wait_for_timeout(4200)
    check(await ev("document.querySelectorAll('#opts .opt.in').length") == 2, f'{tag}: assistant demo')
    await audit(pg, tag, 'assistant', lang)
    await ev("document.querySelector('#seats').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
    await pg.click('#seats button.free:not(.sel)'); check(await txt('#seat-n') != '14A', f'{tag}: seat pick')
    await ev('scrollTo(0, document.documentElement.scrollHeight)'); await pg.wait_for_timeout(900)
    await audit(pg, tag, 'home end', lang)

    # ---------- results ----------
    await ev('scrollTo(0,0)'); await pg.wait_for_timeout(500)
    await pg.click('[data-pop=to]'); await pg.wait_for_timeout(200); await pg.click('.pop .ao[data-c=SYZ]'); await pg.wait_for_timeout(150)
    await pg.click('#go'); await pg.wait_for_timeout(1700)
    check(await ev("!document.querySelector('#v-results').hidden && document.querySelector('#v-home').hidden"), f'{tag}: results view did not open')
    check(t['shiraz'] in await txt('#rs-route'), f'{tag}: results header ' + await txt('#rs-route'))
    nfl = await ev("document.querySelectorAll('.fl').length")
    check(nfl >= 3, f'{tag}: only {nfl} flights'); check(await ev("document.querySelectorAll('.rd').length") == 7, f'{tag}: date ribbon')
    check(await ev("document.querySelectorAll('.leg').length") == 2, f'{tag}: legs')
    check(t['notsel'] in await txt('#sum'), f'{tag}: summary initial state')
    await audit(pg, tag, 'results list', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-results.png')
    await pg.click('#sort [data-sort=price]'); await pg.wait_for_timeout(150)
    pr = await ev("[...document.querySelectorAll('.fl [data-cabb=Y] b')].map(b => +b.textContent.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^0-9]/g, ''))")
    check(pr == sorted(pr) and len(pr) == nfl, f'{tag}: sort by price {pr}')
    await pg.click('#sort [data-sort=dep]')
    await pg.click('.tod[data-tod=ev]'); await pg.wait_for_timeout(150)
    nev = await ev("document.querySelectorAll('.fl').length"); check(nev < nfl, f'{tag}: time filter')
    await pg.click('.tod[data-tod=ev]'); await pg.wait_for_timeout(150)
    # open a flight: fare families + seat map
    await pg.click('.fl:nth-child(2) [data-cabb=Y]'); await pg.wait_for_timeout(900)
    check(await ev("document.querySelectorAll('.fl.open .fam').length") == 3, f'{tag}: economy fare families')
    check(await ev("document.querySelectorAll('.fl.open .seat').length") > 100, f'{tag}: seat map missing')
    check(await ev("document.querySelector('.fl.open').getBoundingClientRect().top") < h * .6, f'{tag}: opened flight not scrolled into view')
    num = "(s) => +s.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[^0-9]/g, '')"
    p0 = await ev(f"({num})(document.querySelector('.fl-f b').textContent)")
    await pg.click('.fam[data-fam=flex] [data-pick]'); await pg.wait_for_timeout(150)
    p1 = await ev(f"({num})(document.querySelector('.fl-f b').textContent)")
    check(p1 > p0, f'{tag}: Flex should cost more than Classic ({p0} -> {p1})')
    await pg.click('.fam[data-fam=classic] [data-pick]'); await pg.wait_for_timeout(150)
    await ev("document.querySelector('.fl.open .seat.free:not(.xl)').click()"); await pg.wait_for_timeout(150)
    check(await ev("document.querySelector('.pc b').textContent.trim()") != '—', f'{tag}: seat not assigned')
    p2 = await ev(f"({num})(document.querySelector('.fl-f b').textContent)")
    check(p2 == p0, f'{tag}: standard seat should be free on Classic')
    await ev("document.querySelector('.pc').click(); document.querySelector('.fl.open .seat.free.xl').click()"); await pg.wait_for_timeout(150)
    p3 = await ev(f"({num})(document.querySelector('.fl-f b').textContent)")
    check(p3 > p0, f'{tag}: extra-legroom seat should add a fee on Classic')
    await ev("document.querySelector('.seatbox').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
    await audit(pg, tag, 'results fare + seats', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-fare.png')
    await ev("document.querySelector('.fl-x').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(300)
    await pg.screenshot(path=f'shots/{lang}-{w}-fare2.png')
    await ev("document.querySelector('.fl-f [data-confirm]').click()"); await pg.wait_for_timeout(1500)
    check(await ev("document.querySelector('.leg[data-leg=\"1\"]').getAttribute('aria-selected')") == 'true', f'{tag}: should move to the return leg')
    check(await ev(f"({num})(document.querySelector('#sum .tot b').textContent)") == p3, f'{tag}: summary total after outbound')
    # ribbon on return leg
    await ev("document.querySelectorAll('.rd:not(:disabled)')[document.querySelectorAll('.rd').length - 1].click()"); await pg.wait_for_timeout(1100)
    check(await ev("document.querySelectorAll('.fl').length") >= 3, f'{tag}: ribbon reload')
    sel = '.fl [data-cabb=C]:not(:disabled)'
    await ev(f"document.querySelector('{sel}').click()"); await pg.wait_for_timeout(900)
    check(await ev("document.querySelectorAll('.fl.open .fam').length") == 2, f'{tag}: business fare families')
    check(await ev("document.querySelectorAll('.fl.open .srow.biz .seat.free').length") >= 1, f'{tag}: business cabin map')
    await audit(pg, tag, 'results business', lang)
    cta = '#sumbar [data-confirm]' if w <= 1100 else '#sum [data-confirm]'
    await pg.click(cta); await pg.wait_for_timeout(500)
    check(t['cont'] in await txt('#sum'), f'{tag}: continue button missing')
    tot = await ev(f"({num})(document.querySelector('#sum .tot b').textContent)"); check(tot > p3, f'{tag}: total with both legs {tot}')
    await ev("document.querySelector('#sum').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(400)
    await audit(pg, tag, 'results summary', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-summary.png')
    await ev("document.querySelector('#sum [data-next=pax]').click()"); await pg.wait_for_timeout(300)
    check(t['preview'] in await txt('#toast'), f'{tag}: continue toast')
    await ev("document.querySelector('#sum [data-chg=\"0\"]').click()"); await pg.wait_for_timeout(1100)
    check(await ev("document.querySelector('.leg[data-leg=\"0\"]').getAttribute('aria-selected')") == 'true' and await ev("!!document.querySelector('.fl.chosen')"), f'{tag}: change outbound')
    # language switch inside results
    await ev("document.querySelector('[data-lang]').click()"); await pg.wait_for_timeout(400)
    other = T['en' if lang == 'fa' else 'fa']
    check(await ev("document.documentElement.dir") == other['dir'] and other['cur'] in await txt('#sum .tot b'), f'{tag}: language switch in results')
    await audit(pg, tag, 'results after language switch', 'en' if lang == 'fa' else 'fa')
    await ev("document.querySelector('[data-lang]').click()"); await pg.wait_for_timeout(400)
    # edit search in place
    await ev('scrollTo(0,0)'); await pg.click('#rs-edit'); await pg.wait_for_timeout(300)
    check(await ev("!!document.querySelector('#rs-editbox #card') && !document.querySelector('#rs-editbox').hidden"), f'{tag}: edit search did not open the form')
    await pg.click('[data-pop=pax]'); await pg.wait_for_timeout(250); await pop_ok('passengers (results)')
    await pg.click('.pop [data-px=ch][data-d="1"]'); await pg.click('.pop .pop-f [data-close]')
    await audit(pg, tag, 'results edit search', lang)
    await pg.click('#tripseg [data-trip=one]'); await pg.click('#go'); await pg.wait_for_timeout(1700)
    check(await ev("document.querySelector('#rs-editbox').hidden && document.querySelectorAll('.leg').length === 1"), f'{tag}: one-way re-search')
    await pg.click('.fl [data-cabb=Y]'); await pg.wait_for_timeout(700)
    check(await ev("document.querySelectorAll('.pc').length") == 3, f'{tag}: seat chips should match adults + children')
    await pg.click('#rs-back'); await pg.wait_for_timeout(500)
    check(await ev("!document.querySelector('#v-home').hidden && !!document.querySelector('#book #card')"), f'{tag}: back to home')

    # ---------- flight details, stop, seat features (one-stop sample route, with a child) ----------
    await ev('scrollTo(0,0)'); await pg.wait_for_timeout(300)
    await pg.click('[data-pop=to]'); await pg.wait_for_timeout(200); await pg.click('.pop .ao[data-c=KIH]'); await pg.wait_for_timeout(150)
    await pg.click('#go'); await pg.wait_for_timeout(1700)
    check(await ev("document.querySelectorAll('.mid.st').length") == 1, f'{tag}: one-stop flight missing')
    await ev("document.querySelector('.mid.st').closest('.fl').querySelector('[data-det]').click()"); await pg.wait_for_timeout(400)
    dtx = await txt('.fl-d')
    check(await ev("document.querySelectorAll('.fl-d .tl li').length") == 6 and t['term'] in dtx and t['stop'] in dtx, f'{tag}: flight details content')
    await ev("document.querySelector('.fl-d').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(300)
    await audit(pg, tag, 'flight details', lang)
    ov = await ev('''() => [...document.querySelectorAll('.tl li')].filter((li) => { const a = li.querySelector('time'), b = li.querySelector('div'); if (!a.textContent.trim()) return false; const r = document.createRange(); r.selectNodeContents(a); const x = r.getBoundingClientRect(), y = b.getBoundingClientRect(); return !(x.right <= y.left + 1 || x.left >= y.right - 1); }).length''')
    check(ov == 0, f'{tag}: timeline times overlap the text ({ov})')
    await pg.screenshot(path=f'shots/{lang}-{w}-details.png')
    await ev("document.querySelector('.mid.st').closest('.fl').querySelector('[data-cabb=Y]').click()"); await pg.wait_for_timeout(900)
    check(await ev("!!document.querySelector('.fl.open .fl-d')"), f'{tag}: details should stay open with fares')
    check(await ev("document.querySelectorAll('.fl.open .wing').length") == 2 and await ev("document.querySelectorAll('.fl.open .dr').length") >= 8, f'{tag}: wings and doors on the seat map')
    check(await ev("(() => { const s = document.querySelector('.smap'), z = s.querySelector('.cz.y'); return Math.abs(s.scrollTop - (z.offsetTop - 8)) < 30; })()"), f'{tag}: seat map should open at the chosen cabin')
    await ev("document.querySelector('.fl.open .seat.free[data-seat^=\"14\"], .fl.open .seat.free[data-seat^=\"13\"], .fl.open .seat.free[data-seat^=\"10\"]').focus()"); await pg.wait_for_timeout(150)
    sd = await txt('#sd-box'); check('USB' in sd and ('76' in sd or '۷۶' in sd), f'{tag}: seat features on focus: {sd[:60]}')
    await ev("document.querySelectorAll('.pc')[2].click(); document.querySelector('.fl.open .seat.free[data-seat^=\"11\"], .fl.open .seat.free[data-seat^=\"12\"]').click()"); await pg.wait_for_timeout(200)
    check(t['exitmsg'] in await txt('#sd-box') and await ev("document.querySelectorAll('.pc')[2].querySelector('b').textContent.trim()") == '—', f'{tag}: child must not get an exit-row seat')
    await ev("document.querySelectorAll('.pc')[0].click(); document.querySelector('.fl.open .seat.free[data-seat^=\"11\"], .fl.open .seat.free[data-seat^=\"12\"]').click()"); await pg.wait_for_timeout(200)
    check(await ev("document.querySelectorAll('.pc')[0].querySelector('b').textContent.trim()") != '—', f'{tag}: adult should get the exit-row seat')
    await ev("document.querySelector('.seatbox').scrollIntoView({block:'start'})"); await pg.wait_for_timeout(400)
    await audit(pg, tag, 'seat map details', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-seatmap.png')
    await ev("document.querySelector('.smap').scrollTop = 99999"); await pg.wait_for_timeout(200)
    await audit(pg, tag, 'seat map rear', lang)
    await pg.click('#rs-back'); await pg.wait_for_timeout(500)

    # ---------- account: sign up with a code, profile, password, log out, log in ----------
    opener = '.mnav [data-auth]' if mobile else '#acct'
    if w <= 1100 and not mobile:
        opener = '#acct'
    await pg.click(opener); await pg.wait_for_timeout(350)
    check(await ev("!!document.querySelector('.dlg') && document.querySelector('.dlg').contains(document.activeElement)"), f'{tag}: sign-in dialog did not open with focus inside')
    await audit(pg, tag, 'sign-in dialog', lang)
    await pg.click('.dlg [data-a=send]'); check(t['notvalid'] in await txt('.a-err'), f'{tag}: empty id validation')
    await pg.fill('#a-id', '۰۹۱۲۳۴۵۶۷۸۹'); await pg.click('.dlg [data-a=send]'); await pg.wait_for_timeout(250)
    check(await ev("document.querySelectorAll('.otp-i').length") == 5 and '0912' in await txt('.a-sub'), f'{tag}: code step')
    tm = await txt('#a-res'); check('1:00' in tm or '0:5' in tm or '۱:۰۰' in tm or '۰:۵' in tm, f'{tag}: resend timer shows {tm}')
    await pg.keyboard.type('00000'); await pg.wait_for_timeout(200)
    check(t['otpbad'] in await txt('.a-err'), f'{tag}: wrong code error')
    await audit(pg, tag, 'code step with error', lang)
    await pg.screenshot(path=f'shots/{lang}-{w}-otp.png')
    await pg.keyboard.type('12345'); await pg.wait_for_timeout(300)
    check(await ev("!!document.querySelector('#a-first')"), f'{tag}: profile step after code')
    await pg.click('.dlg [data-a=create]'); check((await txt('.a-err')) != '', f'{tag}: profile validation')
    await pg.fill('#a-first', 'سارا' if lang == 'fa' else 'Sara'); await pg.fill('#a-last', 'محمدی' if lang == 'fa' else 'Mohammadi')
    await pg.fill('#a-alt', 'not-an-email'); await pg.click('.dlg [data-a=create]'); check(t['notvalid'] in await txt('.a-err'), f'{tag}: email validation')
    await pg.fill('#a-alt', ''); await pg.click('.dlg [data-a=create]'); check(t['accept'] in await txt('.a-err'), f'{tag}: terms required')
    await audit(pg, tag, 'profile step', lang)
    await pg.check('#a-terms'); await pg.click('.dlg [data-a=create]'); await pg.wait_for_timeout(500)
    check(await ev("!document.querySelector('.dlg')") and t['created'] in await txt('#toast'), f'{tag}: account creation')
    if mobile:
        check(await ev("!document.querySelector('#v-profile').hidden"), f'{tag}: mobile account button should land on the profile')
    else:
        check(('سارا' if lang == 'fa' else 'Sara') in await txt('#acct'), f'{tag}: header should show the user')
        await pg.click('#acct'); await pg.wait_for_timeout(200)
        check(await ev("(() => { const m = document.querySelector('.amenu'); if (!m) return false; const r = m.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()"), f'{tag}: account menu')
        await audit(pg, tag, 'account menu', lang)
        await pg.click('.amenu [data-go-profile]'); await pg.wait_for_timeout(400)
    check(await ev("!document.querySelector('#v-profile').hidden") and '0912' in await txt('#pf-id'), f'{tag}: profile view')
    await audit(pg, tag, 'profile', lang)
    hd = await ev('''() => { const a = document.querySelector('#pf-av').getBoundingClientRect(), n = document.querySelector('#pf-name').getBoundingClientRect(); return document.documentElement.dir === 'rtl' ? a.left > n.right - 1 : a.right < n.left + 1; }''')
    check(hd, f'{tag}: avatar should sit before the name')
    await pg.screenshot(path=f'shots/{lang}-{w}-profile.png')
    await pg.fill('#p-email', 'bad@'); await pg.click('#pf-save'); check(t['notvalid'] in await txt('#pf-msg'), f'{tag}: profile email validation')
    await pg.fill('#p-email', 'sara@example.com'); await pg.click('#pf-save'); check(t['saved'] in await txt('#pf-msg'), f'{tag}: profile save')
    await pg.click('#pf-pw-b'); await pg.wait_for_timeout(300)
    await pg.fill('#a-p1', 'secret12'); await pg.fill('#a-p2', 'secret13'); await pg.click('.dlg [data-a=setpw]')
    check(t['match'] in await txt('.a-err'), f'{tag}: password mismatch')
    await audit(pg, tag, 'set password', lang)
    await pg.fill('#a-p2', 'secret12'); check(await ev("document.querySelectorAll('.rules li.ok').length") == 3, f'{tag}: password rules')
    await pg.click('.dlg [data-a=setpw]'); await pg.wait_for_timeout(300)
    check(t['pwset'] in await txt('#pf-pw-s'), f'{tag}: password status')
    await pg.click('#sw-push'); check(await ev("document.querySelector('#sw-push').getAttribute('aria-checked')") == 'true', f'{tag}: notification switch')
    await ev("document.querySelector('.pf-grid').lastElementChild.scrollIntoView()"); await pg.wait_for_timeout(300)
    await audit(pg, tag, 'profile end', lang)
    await ev('scrollTo(0,0)'); await pg.click('#v-profile [data-logout]'); await pg.wait_for_timeout(400)
    check(await ev("!document.querySelector('#v-home').hidden") and t['out'] in await txt('#toast'), f'{tag}: log out')
    # log in again with the password; forgot-password flow first
    if mobile:
        await pg.click('#burger'); await pg.click('#menu [data-auth]')
    else:
        check(t['login'] in await txt('#acct'), f'{tag}: header should show log in after logout'); await pg.click('#acct')
    await pg.wait_for_timeout(300)
    await pg.click('.dlg [data-m=pw]'); await pg.fill('#a-id', '09123456789'); await pg.fill('#a-pw', 'nope'); await pg.click('.dlg [data-a=login]')
    check(t['wrong'] in await txt('.a-err'), f'{tag}: wrong password')
    await audit(pg, tag, 'password login error', lang)
    await pg.click('.dlg [data-a=forgot]'); await pg.wait_for_timeout(200)
    check(await ev("document.querySelector('#a-id').value") == '09123456789', f'{tag}: forgot keeps the id')
    await pg.click('.dlg [data-a=send]'); await pg.wait_for_timeout(250); await pg.keyboard.type('54321'); await pg.wait_for_timeout(300)
    await pg.fill('#a-p1', 'newpass99'); await pg.fill('#a-p2', 'newpass99'); await pg.click('.dlg [data-a=setpw]'); await pg.wait_for_timeout(300)
    check(await ev("!!document.querySelector('#a-pw')"), f'{tag}: back to password login after reset')
    await pg.fill('#a-pw', 'newpass99'); await pg.press('#a-pw', 'Enter'); await pg.wait_for_timeout(400)
    check(await ev("!document.querySelector('.dlg')"), f'{tag}: log in with the new password')
    if not mobile: check(('سارا' if lang == 'fa' else 'Sara') in await txt('#acct'), f'{tag}: logged in again')
    # Escape closes the dialog; club tile follows the state
    check(await ev("!!document.querySelector('#club-acts [data-go-profile]')"), f'{tag}: club tile should offer the profile')
    check(('سارا' if lang == 'fa' else 'Sara') in await txt('#hello-t'), f'{tag}: greeting should use the first name')
    check(not errs, f'{tag}: JS errors {errs}')
    await b.close()

async def extra(p):
    print('== reduced motion')
    b = await p.chromium.launch(); c = await b.new_context(viewport={'width': 1280, 'height': 800}, reduced_motion='reduce'); pg = await c.new_page()
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(URL); await pg.wait_for_timeout(900)
    check(await pg.evaluate("[...document.querySelectorAll('.rv')].every(e => getComputedStyle(e).opacity === '1')"), 'reduced motion: hidden content')
    check(await pg.evaluate("(() => { const c = document.querySelector('#nmap'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4) if (d[i]) return true; return false; })()"), 'reduced motion: empty map')
    await pg.click('[data-pop=to]'); await pg.click('.pop .ao[data-c=KIH]'); await pg.click('#go'); await pg.wait_for_timeout(400)
    check(await pg.evaluate("document.querySelectorAll('.fl').length") >= 3, 'reduced motion: results')
    check(not errs, f'reduced motion: errors {errs}')
    await b.close()
    print('== sandboxed frame (as published)')
    src = open('wrapped.html', encoding='utf-8').read()
    open('host.html', 'w', encoding='utf-8').write('<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe id="f" sandbox="allow-scripts" style="border:0;width:1280px;height:800px" srcdoc="' + html.escape(src, quote=True) + '"></iframe>')
    b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1280, 'height': 800})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'ERR_' not in m.text and 'Failed to load resource' not in m.text else None)
    await pg.goto('file://' + os.path.abspath('host.html')); await pg.wait_for_timeout(1500)
    fr = pg.frames[1]
    await fr.click('#promo-b'); await fr.click('.links a[href="#routes"]'); await fr.wait_for_timeout(900)
    await fr.click('.r[data-i="2"]'); await fr.click('#rgo'); await fr.wait_for_timeout(900)
    await fr.click('#go'); await fr.wait_for_timeout(1500)
    await fr.click('.fl [data-cabb=Y]'); await fr.wait_for_timeout(600)
    check(await fr.evaluate("document.querySelectorAll('.fl.open .fam').length") == 3, 'sandbox: results do not work')
    await fr.click('.links a[href="#club"]'); await fr.wait_for_timeout(700)
    check(await fr.evaluate("!document.querySelector('#v-home').hidden"), 'sandbox: nav link from results')
    await fr.evaluate("document.querySelector('[data-lang]').click()")
    check(await fr.evaluate("document.documentElement.dir") == 'ltr', 'sandbox: language switch')
    check(not errs, f'sandbox: errors {errs}')
    await b.close()

async def main():
    os.makedirs('shots', exist_ok=True)
    async with async_playwright() as p:
        for lang in LANGS:
            for w, h in VPS: await run(p, w, h, lang)
        if len(args) < 2: await extra(p)
    print('\nRESULT:', 'ALL PASSED' if not fails else f'{len(fails)} FAILED')
    for f in fails: print(' -', f)
asyncio.run(main())
