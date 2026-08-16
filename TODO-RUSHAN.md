# Your site — what's done, what's left

---

## The 3 things only you can do

### 1. Turn on the forms (2 minutes) ← **the only one that matters**

Open **`js/form-config.js`** and paste one URL. That's the whole job — it powers
**both** the contact form and the review form.

1. Free account at [formspree.io](https://formspree.io) → **New Form**
2. Copy the endpoint (looks like `https://formspree.io/f/abcdwxyz`)
3. Paste it here:
   ```js
   window.RH_FORM_ENDPOINT = 'https://formspree.io/f/abcdwxyz';
   ```
4. Submit each form once yourself — Formspree asks you to confirm the first time.

**If you skip this, nothing breaks.** Both forms fall back to opening the visitor's
email app with everything pre-filled and addressed to you.

### 2. Two screenshots

| Needed | Save as |
|---|---|
| ErfolgLiving still image | `img/rh/projects/erfolg.png` |
| Aurelio still image | `img/rh/projects/aurelio.png` |

Then open `admin.html` → **Projects** → set the *Image path* on each. No HTML editing.
(Both currently show a plain grey card behind the autoplaying video — not broken,
just plain if the video is slow to load.)

### 3. Check your dates

Your resume says jobs starting **2026**, which reads as future-dated. That's what
your old site said, so I kept it — but worth a look.

---

## Adding a product

1. `admin.html` → **Products** tab → fill it in
2. **Publish** tab → *Download products.js*
3. Drop the file into `data/` → commit

Same flow for projects and reviews. Until you add a product, the section shows a
tidy "In the works" card — it doesn't look broken.

Product images go in `img/rh/products/`.

---

## How the homepage is built

Every section uses the **original Atelys design and animations**. Only the content
changed.

| # | Section | Template design | Content from |
|---|---|---|---|
| W/01 | Recent Freelance Works | pinned grid, video reveals | `data/projects.js` → **Industry** |
| A/02 | About + stats | counters, manifest | hand-written |
| — | Blogs & writings | pinned sticky-image divider | hand-written in `index.html` |
| P/03 | Products | perspective list (tilt on scroll) | `data/products.js` |
| PP/04 | Personal projects | staggered 3-card grid | `data/projects.js` → **Personal** |
| CV/05 | Resume | resume rows + toolbox | hand-written |
| R/06 | Kind words | template testimonial cards | `data/reviews.js` |

> **Why the load order matters:** `data/*.js` and `js/render.js` load *before*
> `js/app.js`. The template binds all its GSAP animations on `DOMContentLoaded`,
> so anything rendered after that point would never animate. Don't reorder those
> script tags.

---

## Keep `admin.html` private

No password. Run it locally, or delete it from the server after publishing.
It's already `noindex`.

---

## To publish

Upload everything **except** `_removed/`, `admin.html` and this file:

```
index.html  about-me.html  works-default.html  contact.html  404.html
css/  js/  img/  data/  fonts/  video/
```

`mail.php` is only needed if you host on a PHP server — with Formspree you can
skip it.

---

## Optional polish

- **Favicon** is still the template's mark (`img/favicon/`). The manifest, titles
  and share previews are all yours now — only the icon artwork is generic.
- **Photography** is mentioned on the About page but you have no photos on the site.
- `_removed/` holds 78 MB of deleted template junk. Delete it once you're happy.
