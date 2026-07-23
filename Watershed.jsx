import './watershed.css';

/* ------------------------------------------------------------------ */
/* Signature element: the watershed drawn as its own navigation.       */
/* Nodes are links to the reach pages.                                 */
/* ------------------------------------------------------------------ */

const NODES = [
  { slug: 'ok-run',   cx: 120, cy: 205, r: 7, label: 'OK RUN' },
  { slug: 'property', cx: 228, cy: 171, r: 8, label: 'THE PROPERTY', sub: 'HOME SITE', home: true },
  { slug: 'mcmahon',  cx: 500, cy: 163, r: 7, label: 'McMAHON CREEK' },
];

export function StreamSchematic({ Link = 'a', hrefKey = 'href', base = '/watershed' }) {
  const LinkEl = Link;
  return (
    <div className="schematic">
      <svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg">
        <title>Ok Run joins McMahon Creek, which flows east to the Ohio River</title>

        <path className="reachline" strokeWidth="2.5"
              d="M40 40 C 160 60, 200 120, 330 130 S 540 175, 660 200" />
        <path className="trib" strokeWidth="5"
              d="M120 205 C 200 195, 250 160, 330 130" />
        <path className="trib" strokeWidth="1.2" opacity=".4" d="M60 150 C 130 155, 170 150, 230 143" />
        <path className="trib" strokeWidth="1.2" opacity=".4" d="M420 90 C 460 115, 480 135, 520 152" />

        {NODES.map(n => (
          <LinkEl key={n.slug} {...{ [hrefKey]: `${base}/${n.slug}` }} className="gnode">
            <g>
              <circle className={n.home ? 'node-home' : 'node'} cx={n.cx} cy={n.cy} r={n.r} />
              <text className="nlabel" x={n.cx} y={n.cy + 25} textAnchor="middle">{n.label}</text>
              {n.sub && <text className="nsub" x={n.cx} y={n.cy + 38} textAnchor="middle">{n.sub}</text>}
            </g>
          </LinkEl>
        ))}

        <circle className="node" cx="330" cy="130" r="6" />
        <text className="nsub" x="330" y="112" textAnchor="middle">CONFLUENCE</text>
        <circle className="node" cx="660" cy="200" r="5" />
        <text className="nsub" x="655" y="222" textAnchor="end">OHIO RIVER</text>
        <text className="nsub" x="40" y="30">HEADWATERS · UNION TWP</text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function RecordStrip({ items }) {
  return (
    <dl className="record">
      {items.map(i => (
        <div key={i.label}>
          <dt>{i.label}</dt>
          <dd>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionHead({ title, count }) {
  return (
    <div className="sechead">
      <h2>{title}</h2>
      {count && <span className="count">{count}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hauls — the cumulative total is computed here, never hand-entered.  */
/* ------------------------------------------------------------------ */

export function Hauls({ hauls = [], since }) {
  if (!hauls.length) {
    return (
      <section>
        <SectionHead title="Hauls" />
        <p className="empty">No hauls logged yet. Add one from /admin after the next cleanup.</p>
      </section>
    );
  }

  const sorted = [...hauls].sort((a, b) => (a.date < b.date ? 1 : -1));
  const totalLb = sorted.reduce((s, h) => s + (Number(h.weight_lb) || 0), 0);
  const firstDate = sorted[sorted.length - 1]?.date;

  return (
    <section>
      <SectionHead title="Hauls" count={`${sorted.length} pickups logged`} />

      <div className="tally">
        <span className="tallynum">{totalLb.toLocaleString()}</span>
        <span className="tallylab">
          pounds off the ground<br />since {since || formatMonth(firstDate)}
        </span>
      </div>

      <div className="accum" aria-hidden="true">
        {[...sorted].reverse().map(h => (
          <span key={h.date + h.location} style={{ flex: Number(h.weight_lb) || 1 }}
                title={`${h.date} — ${h.weight_lb} lb`} />
        ))}
      </div>

      {sorted.map(h => (
        <div className="haul" key={h.date + h.location}>
          <time dateTime={h.date}>{h.date}</time>
          <span className="where">
            {h.location}
            {h.notable?.length > 0 && <span className="items">{h.notable.join(' · ')}</span>}
          </span>
          <span className="wt">{Number(h.weight_lb).toLocaleString()} lb</span>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Photo points — one card per station, visits accumulate inside it.   */
/* Shows first and most recent by default.                             */
/* ------------------------------------------------------------------ */

export function PhotoPoints({ points = [] }) {
  if (!points.length) {
    return (
      <section>
        <SectionHead title="Photo points" />
        <p className="empty">No stations established yet.</p>
      </section>
    );
  }

  return (
    <section>
      <SectionHead title="Photo points" count={`${points.length} stations`} />
      {points.map(p => {
        const visits = [...(p.visits || [])].sort((a, b) => (a.date < b.date ? -1 : 1));
        const first = visits[0];
        const last = visits[visits.length - 1];
        const latest = visits.length > 1 ? last : null;
        return (
          <article className="pp" key={p.id}>
            <div className="pphead">
              <div>
                <span className="ppid">{p.id}</span> <span className="ppname">{p.name}</span>
              </div>
              <span className="ppmeta">
                {p.bearing_deg != null && `BRG ${p.bearing_deg}° · `}EST. {p.established}
              </span>
            </div>
            <div className="frames">
              {first && <Frame visit={first} name={p.name} />}
              {latest && <Frame visit={latest} name={p.name} />}
            </div>
            {latest?.note && <p className="ppnote">{latest.note}</p>}
          </article>
        );
      })}
    </section>
  );
}

function Frame({ visit, name }) {
  return (
    <figure className="frame" style={{ margin: 0 }}>
      <img src={visit.image} alt={`${name}, photographed ${visit.date}`} loading="lazy" />
      <b>{visit.date}</b>
    </figure>
  );
}

/* ------------------------------------------------------------------ */

export function Dispatches({ dispatches = [], Link = 'a', hrefKey = 'href', base = '/watershed/dispatches' }) {
  const LinkEl = Link;
  if (!dispatches.length) {
    return (
      <section>
        <SectionHead title="Dispatches" />
        <p className="empty">Nothing written up yet.</p>
      </section>
    );
  }
  const sorted = [...dispatches].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <section>
      <SectionHead title="Dispatches" count="from the home site" />
      {sorted.map(d => (
        <LinkEl key={d.slug} {...{ [hrefKey]: `${base}/${d.slug}` }} className="disp">
          <p className="dmeta">{d.date}{d.reach ? ` · ${reachName(d.reach)}` : ''}</p>
          <p className="dtitle">{d.title}</p>
          {d.excerpt && <p className="dexc">{d.excerpt}</p>}
        </LinkEl>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function Disclaimer() {
  return (
    <footer>
      <p className="note">
        A personal project, on personal time, on private land. Not affiliated with
        or endorsed by any employer or agency.
        <br /><br />
        Locations near residences are given by reach, not coordinate. Neighbors appear
        here only with permission, and anything can come down on request.
      </p>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Page shell                                                          */
/* ------------------------------------------------------------------ */

export default function WatershedOverview({ hauls, points, dispatches, Link, hrefKey }) {
  return (
    <div className="watershed">
      <div className="wrap">
        <header className="mast">
          <p className="eyebrow">McMahon Creek Basin · Belmont County, Ohio</p>
          <h1>The Holler<em>Ground Record</em></h1>
          <p className="standfirst">
            Ohio EPA sampled this basin in 2009 and is sampling it again now. This is the
            part in between — what two people who live on Ok Run saw, hauled out, and wrote down.
          </p>
        </header>

        <StreamSchematic Link={Link} hrefKey={hrefKey} />

        <RecordStrip items={[
          { label: 'Mainstem length', value: '28.1 mi' },
          { label: 'Drainage area',   value: '91 sq mi' },
          { label: 'USGS gages',      value: 'Glencoe · Bellaire' },
          { label: 'Record begins',   value: '2026' },
        ]} />

        <Hauls hauls={hauls} />
        <PhotoPoints points={points} />
        <Dispatches dispatches={dispatches} Link={Link} hrefKey={hrefKey} />
        <Disclaimer />
      </div>
    </div>
  );
}

/* helpers */
const REACHES = { 'ok-run': 'Ok Run', property: 'The property', mcmahon: 'McMahon Creek' };
function reachName(slug) { return REACHES[slug] || slug; }
function formatMonth(d) {
  if (!d) return '';
  const [y, m] = d.split('-');
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${months[Number(m) - 1]} ${y}`;
}
