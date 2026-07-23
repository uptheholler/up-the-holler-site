# Up the Holler — site scaffold

A plain HTML/CSS/JS site. No build step, no npm, no framework —
open any `.html` file in a browser and it just works. That also
means it's simple to host: upload the files, done.

## What's here

```
index.html         Home
photography.html   Photography gallery
writing.html       Writing samples
travel.html        Travel blog
cooking.html        Cooking
projects.html       Side projects hub (radio show, event app, etc.)
css/style.css       All styling — palette, type, layout
js/nav.js           Mobile menu toggle
images/             Put your photos here
```

Every page has a `.editnote` box near the top explaining exactly what
to swap out. Delete those boxes once you've replaced the placeholder
content.

## Step 1 — Upload to GitHub

1. Go to github.com, sign in, click **New repository**.
2. Name it something like `up-the-holler-site`. Keep it Public
   (private also works, doesn't matter for this). Don't add a
   README/gitignore in the GitHub setup screen — you already have one.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in every file and folder from this scaffold (`index.html`,
   `css/`, `js/`, `images/`, all the `.html` pages, this `README.md`).
5. Scroll down, click **Commit changes**.

That's it — no command line needed.

## Step 2 — Deploy with Vercel

1. Go to vercel.com, sign in with GitHub (you already linked these).
2. Click **Add New → Project**.
3. Pick the `up-the-holler-site` repo from the list, click **Import**.
4. Leave all settings as default — it's a static site, Vercel
   detects that automatically. Click **Deploy**.
5. In a minute or two you'll get a live link like
   `up-the-holler-site.vercel.app`. That's your site, already live.

## Step 3 — Connect uptheholler.net

1. In the Vercel project, go to **Settings → Domains**.
2. Type in `uptheholler.net`, click **Add**.
3. Vercel will show you one or two DNS records to add (usually an
   `A` record and a `CNAME` for `www`).
4. Go to Porkbun → your domain → **DNS records**, and add exactly
   what Vercel showed you.
5. DNS changes can take anywhere from a few minutes to a few hours
   to take effect. Once it does, `uptheholler.net` loads your site.

## Making changes later

Edit a file on GitHub directly (click the pencil icon on any file),
commit the change, and Vercel automatically redeploys the live site
within a minute or two. No local setup required unless you want one.

## Adding a new page

Copy an existing `.html` file (e.g. `cooking.html`), rename it,
change the `<title>` and content, and add a link to it in the
`nav-links` list in every page's header.
