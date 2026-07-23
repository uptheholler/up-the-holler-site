/* Watershed section renderer.
   Reads /data/watershed.json and fills the containers in watershed.html.
   No build step, no dependencies. */

(function () {
  'use strict';

  const REACHES = {
    'ok-run': 'Ok Run',
    'property': 'The property',
    'mcmahon': 'McMahon Creek'
  };

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function el(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  function monthLabel(ym) {
    if (!ym) return '';
    const parts = ym.split('-');
    return MONTHS[Number(parts[1]) - 1] + ' ' + parts[0];
  }

  function byDateDesc(a, b) { return a.date < b.date ? 1 : -1; }
  function byDateAsc(a, b) { return a.date < b.date ? -1 : 1; }

  /* ---------- hauls ---------- */

  function renderHauls(hauls) {
    const wrap = el('hauls');
    if (!wrap) return;

    if (!hauls || !hauls.length) {
      wrap.innerHTML = '<p class="empty">No hauls logged yet.</p>';
      return;
    }

    const sorted = hauls.slice().sort(byDateDesc);
    const total = sorted.reduce(function (s, h) { return s + (Number(h.weight_lb) || 0); }, 0);
    const earliest = sorted[sorted.length - 1].date;

    const count = el('haul-count');
    if (count) count.textContent = sorted.length + ' pickups logged';

    let html = '';

    html += '<div class="tally">'
          +   '<span class="tallynum">' + total.toLocaleString() + '</span>'
          +   '<span class="tallylab">pounds off the ground<br>since '
          +     esc(monthLabel(earliest.slice(0, 7))) + '</span>'
          + '</div>';

    html += '<div class="accum" aria-hidden="true">';
    sorted.slice().reverse().forEach(function (h) {
      const w = Number(h.weight_lb) || 1;
      html += '<span style="flex:' + w + '" title="' + esc(h.date) + ' — ' + w + ' lb"></span>';
    });
    html += '</div>';

    sorted.forEach(function (h) {
      const items = (h.notable && h.notable.length)
        ? '<span class="items">' + h.notable.map(esc).join(' · ') + '</span>'
        : '';
      html += '<div class="haul">'
            +   '<time datetime="' + esc(h.date) + '">' + esc(h.date) + '</time>'
            +   '<span class="where">' + esc(h.location) + items + '</span>'
            +   '<span class="wt">' + (Number(h.weight_lb) || 0).toLocaleString() + ' lb</span>'
            + '</div>';
    });

    wrap.innerHTML = html;
  }

  /* ---------- photo points ---------- */

  function frame(visit, name) {
    if (visit.image) {
      return '<figure class="frame">'
           +   '<img src="' + esc(visit.image) + '" alt="' + esc(name)
           +     ', photographed ' + esc(visit.date) + '" loading="lazy">'
           +   '<b>' + esc(visit.date) + '</b>'
           + '</figure>';
    }
    return '<figure class="frame frame-empty">'
         +   '<span>NO PHOTO YET</span>'
         +   '<b>' + esc(visit.date) + '</b>'
         + '</figure>';
  }

  function renderPoints(points) {
    const wrap = el('photo-points');
    if (!wrap) return;

    if (!points || !points.length) {
      wrap.innerHTML = '<p class="empty">No stations established yet.</p>';
      return;
    }

    const count = el('pp-count');
    if (count) count.textContent = points.length + ' stations';

    let html = '';
    points.forEach(function (p) {
      const visits = (p.visits || []).slice().sort(byDateAsc);
      const first = visits[0];
      const last = visits.length > 1 ? visits[visits.length - 1] : null;
      const bearing = (p.bearing_deg != null) ? 'BRG ' + p.bearing_deg + '° · ' : '';

      html += '<article class="pp">'
            +   '<div class="pphead">'
            +     '<div><span class="ppid">' + esc(p.id) + '</span> '
            +       '<span class="ppname">' + esc(p.name) + '</span></div>'
            +     '<span class="ppmeta">' + bearing + 'EST. ' + esc(p.established) + '</span>'
            +   '</div>'
            +   '<div class="frames">'
            +     (first ? frame(first, p.name) : '')
            +     (last ? frame(last, p.name) : '')
            +   '</div>'
            +   ((last && last.note) ? '<p class="ppnote">' + esc(last.note) + '</p>' : '')
            + '</article>';
    });

    wrap.innerHTML = html;
  }

  /* ---------- dispatches ---------- */

  function renderDispatches(items) {
    const wrap = el('dispatches');
    if (!wrap) return;

    if (!items || !items.length) {
      wrap.innerHTML = '<p class="empty">Nothing written up yet.</p>';
      return;
    }

    let html = '';
    items.slice().sort(byDateDesc).forEach(function (d) {
      const reach = d.reach ? ' · ' + (REACHES[d.reach] || d.reach) : '';
      const open = d.url ? '<a class="disp" href="' + esc(d.url) + '">' : '<div class="disp">';
      const close = d.url ? '</a>' : '</div>';
      html += open
            +   '<p class="dmeta">' + esc(d.date) + reach + '</p>'
            +   '<p class="dtitle">' + esc(d.title) + '</p>'
            +   (d.excerpt ? '<p class="dexc">' + esc(d.excerpt) + '</p>' : '')
            + close;
    });

    wrap.innerHTML = html;
  }

  /* ---------- go ---------- */

  function fail(msg) {
    ['hauls', 'photo-points', 'dispatches'].forEach(function (id) {
      const wrap = el(id);
      if (wrap) wrap.innerHTML = '<p class="empty">' + esc(msg) + '</p>';
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('/data/watershed.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        renderHauls(data.hauls);
        renderPoints(data.photo_points);
        renderDispatches(data.dispatches);
      })
      .catch(function (err) {
        console.error('watershed.json failed to load:', err);
        fail('Records are temporarily unavailable.');
      });
  });
})();
