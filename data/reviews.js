/* Reviews shown on the site.
 * Managed with admin.html — open it, edit or add a review, download this
 * file, and drop it back into data/.
 * Loaded as a plain script (not fetch) so it works on file:// and any host.
 *
 * Shape of each entry:
 * {
 *   "name":   "Jane Doe",
 *   "role":   "Product Lead, Acme",
 *   "rating": 5,                       // 1-5
 *   "text":   "What it was like working together.",
 *   "image":  "img/rh/reviews/jane.jpg", // optional; initials shown if absent
 *   "date":   "2026-07-01"             // newest first
 * }
 *
 * The four entries below are PLACEHOLDERS so the section looks right while
 * you collect real ones. Replace or delete them in admin.html.
 */
window.RH_REVIEWS = [
  {
    "name": "Placeholder Name",
    "role": "Founder, Company",
    "rating": 5,
    "text": "Replace this with a real review. Rushan took the brief, came back with something sharper than what we asked for, and shipped it on time.",
    "image": "",
    "date": "2026-08-01"
  },
  {
    "name": "Placeholder Name",
    "role": "Product Lead, Company",
    "rating": 5,
    "text": "Replace this with a real review. Clear communication the whole way through — no chasing, no surprises, and the handover was properly documented.",
    "image": "",
    "date": "2026-07-15"
  },
  {
    "name": "Placeholder Name",
    "role": "Marketing Director",
    "rating": 5,
    "text": "Replace this with a real review. The site does exactly what we needed it to do, and it still looks good six months on.",
    "image": "",
    "date": "2026-06-20"
  },
  {
    "name": "Placeholder Name",
    "role": "Editor",
    "rating": 5,
    "text": "Replace this with a real review. Rare to find someone who can write as carefully as they build.",
    "image": "",
    "date": "2026-05-30"
  }
];
