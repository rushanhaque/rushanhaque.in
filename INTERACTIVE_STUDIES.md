# Interactive portfolio studies

All five are currently included in `app/page.tsx`, in numbered order. Each is an independent named component in `components/portfolio-experiments.tsx`; styles are scoped in `app/experiments.css`. Remove its component and matching `StudyIndex` link when deciding which to retain.

1. `PerspectiveStudy` — metallic vector fragments reorganise between a monogram, interface, and poetic composition. Range input and three direct selections support pointer, touch, and keyboard input.
2. `DirectionStudy` — three continuous controls and three presets change a fictional bookshop composition.
3. `DecisionsStudy` — three binary decisions produce eight compositions, with folding panels and a reset. This is labelled as an original exercise, not client process documentation.
4. `EchoStudy` — a deliberately illustrative visual vocabulary narrows across generations and expands when outside perspectives are introduced. The source-note link follows published CMS content when available.
5. `EditionStudy` — 27 combinations of three words generate a postcard with print and flip animations, a contextual contact link, and a standalone SVG download.

These interactions run locally in the browser without API requests or new dependencies. Choices are not persisted or sent to the CMS. Motion remains enabled across system preferences. Existing portfolio sections are retained for comparison. No deployment was performed.
