/* The ONLY framework-specific file in this section.
   Pick the variant that matches your repo, delete the other, and everything
   else (Watershed.jsx, watershed.css) works unchanged.

   Both variants return the same shape:
     { hauls: [...], points: [...], dispatches: [...], reaches: {...} }
*/

/* ==================================================================
   VARIANT A — Vite + React (import.meta.glob, runs at build time)
   ================================================================== */

import matter from 'gray-matter';           // npm i gray-matter

const raw = (glob) =>
  Object.entries(glob).map(([path, src]) => {
    const { data, content } = matter(src);
    const slug = path.split('/').pop().replace(/\.md$/, '');
    return { ...data, slug, body: content };
  });

export function loadWatershed() {
  return {
    hauls: raw(import.meta.glob('/content/watershed/hauls/*.md', { eager: true, as: 'raw' })),
    points: raw(import.meta.glob('/content/watershed/photo-points/*.md', { eager: true, as: 'raw' })),
    dispatches: raw(import.meta.glob('/content/watershed/dispatches/*.md', { eager: true, as: 'raw' })),
    reaches: Object.fromEntries(
      raw(import.meta.glob('/content/watershed/reaches/*.md', { eager: true, as: 'raw' }))
        .map(r => [r.slug, r])
    ),
  };
}

/* ==================================================================
   VARIANT B — Next.js App Router (server component, fs at build time)
   Replace everything above with this:

import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

const DIR = path.join(process.cwd(), 'content', 'watershed');

async function readDir(sub) {
  let files = [];
  try { files = await fs.readdir(path.join(DIR, sub)); } catch { return []; }
  return Promise.all(
    files.filter(f => f.endsWith('.md')).map(async f => {
      const src = await fs.readFile(path.join(DIR, sub, f), 'utf8');
      const { data, content } = matter(src);
      return { ...data, slug: f.replace(/\.md$/, ''), body: content };
    })
  );
}

export async function loadWatershed() {
  const [hauls, points, dispatches, reachList] = await Promise.all([
    readDir('hauls'), readDir('photo-points'), readDir('dispatches'), readDir('reaches'),
  ]);
  return { hauls, points, dispatches, reaches: Object.fromEntries(reachList.map(r => [r.slug, r])) };
}

   Then in app/watershed/page.jsx:

     import WatershedOverview from '@/src/watershed/Watershed';
     import Link from 'next/link';
     import { loadWatershed } from '@/src/watershed/content';

     export default async function Page() {
       const { hauls, points, dispatches } = await loadWatershed();
       return <WatershedOverview hauls={hauls} points={points}
                                 dispatches={dispatches} Link={Link} hrefKey="href" />;
     }
   ================================================================== */
