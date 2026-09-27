# Asset provenance

## Original hero artwork

Final web asset: `public/images/aperture.webp` (1100 × 1100, 43,266 bytes).

Generated specifically for this portfolio with the built-in image generation tool. Original source saved outside the website at `../hero-assets/rushan-silver-cobalt-aperture.png`; green edit at `../hero-assets/rushan-silver-forest-aperture.png`. The white background, silver material, and deep forest surfaces belong to the new art direction.

Original brief: a standalone photorealistic architectural open rectangular ribbon sculpture, two interlocking thick rounded bands, brushed silver/aluminium exteriors and cobalt interiors, pure white studio environment, natural soft contact shadow, directional daylight, centered composition, all edges visible, no text, logos, UI, or props.

Exact green edit prompt:

> Change every cobalt blue surface and blue reflection to deep forest green with base material color #072319. Preserve natural metallic shading, specular highlights, brushed grain, and reflected light within the new forest-green surfaces. Keep the existing silver/aluminum exterior surfaces silver. Keep all other details unchanged: the exact sculpture geometry, open centre, silhouette, curves and twists, camera perspective, scale, composition, square aspect ratio, pure white studio background and soft contact shadow. No blue should remain. Make no other changes. No text or logos.

The final image was encoded and resized using Sharp; no further semantic image edits were performed.

## Project screenshots

Erfolg Living, Casa&Crop, Taif, Aurelio, Velora, Quorum, and Upside Sound screenshots came from the project asset paths on the user's existing portfolio at `rushanhaque.in`. They are evidence of the user's projects, not visual references for the new portfolio design. Original source URLs and descriptions are retained in `content/source-projects.txt`.

## Type and icons

Geist Variable and Instrument Serif are self-hosted from their Fontsource packages. Font licences are included in `public/fonts`. Interface icons use Lucide. The favicon is a new geometric open-frame mark in white and #072319.

## User-supplied Azurio reference

Adapted the service-stack composition and receding-panel choreography from `HTML/js/app.js` (`mxdServicesStack`) and `HTML/css/main.css` in the user's local Azurio template. The implementation in `components/service-stack.tsx` is scoped React/GSAP, with native sticky panels and a static mobile/reduced-motion layout. The oversized ribbon takes compositional reference from Azurio's double marquee. All copy and artwork use this portfolio's own material; no template clients, testimonials, or placeholder imagery were imported.

## Azurio reference study (September 2026)

The user-supplied Azurio HTML personal portfolio was reviewed for large editorial type, fine divider rules, numbered case studies, overlapping geometry, and sticky project presentation. Edition 02 implements these ideas in original React/CSS/GSAP components. No Azurio JavaScript, stock photography, video, fonts, or vendor bundles were copied. Existing project imagery and licensed local fonts are retained.
