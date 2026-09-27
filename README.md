# Rushan Haque — Open Form

A custom React portfolio in white and forest green `#072319`, with GSAP motion, a live typography study, a searchable project collection, and persistent enquiry/review/call-request forms.

```sh
npm run install:ci
npm run dev
```

Development preview: `http://localhost:5173`.

See [implementation and maintenance notes](IMPLEMENTATION_NOTES.md) for architecture, verification, content review items, local database setup, and launch preparation. See [asset provenance](ASSETS.md) for the original artwork and font licences.

See [manual deployment instructions](MANUAL_DEPLOYMENT.md) before publishing. This replaces the previous static portfolio in `rushanhaque/rushanhaque.in`. Automatic Vercel Git deployments are disabled in `vercel.json`; this application requires the documented Worker runtime, D1 database, and authentication gateway. The old website remains recoverable through Git history.

This project uses the Sites Vinext starter with Next-compatible React App Router APIs and a Cloudflare Workers build. The site is initially private. Live calendar booking and email notifications are not connected; call requests are stored as unconfirmed preferences.
