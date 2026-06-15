# Image assets for the React site

Images are referenced from code by their **exact filename** (spaces and capitalisation
matter) via `/assets/<filename>`. Add or replace files in this folder using the names below.

## Currently wired up

Home page carousel (`heroContent.carouselImages`):
- `NIRWANA 1.png` (entrance gate)
- `NIRWANA CLUB HOUSE.jpg`
- `RAHEHA SKYSCAPES.png`
- `RAHEJA GALLERIA.png`
- `RAHEJA AMBARA.jpg` (entrance gate)
- `RAHEJA AMBARA/CLUB HOUSE.jpg`

Luxe page hero carousel (`luxuryContent.carouselImages`):
- `RAHEHA SKYSCAPES.png`
- `RAHEJA AMBARA.jpg` (entrance gate)
- `RAHEJA AMBARA/CLUB HOUSE.jpg`
- `Raheja Waterfront.jpeg`
- `NIRWANA CLUB HOUSE(1).jpg`

Carousel slide timing auto-distributes across the loop, so you can add/remove slides
freely (home loop = 16s, luxe loop = 20s).

Featured projects (`projects`):
- Raheja Nirwana → `NIRWANA 1.png`
- Raheja Ambara → `RAHEJA AMBARA.jpg`

All projects grid (`allProjects`):
- Raheja Towers → `RAHEJA TOWERS.png`
- Raheja Residency → `RAHEJA RESIDENCY.png`
- Raheja Arth → `RAHEJA ARTH.png`
- Raheja Greens → `RAHEJA GREENS.png`
- Raheja SkyScapes → `RAHEHA SKYSCAPES.png`
- Raheja Homes → `RAHEJA HOMES.png`
- Raheja Nirwana 2 → `NIRWANA 2.jpg`
- Raheja Ambara → `RAHEJA AMBARA.jpg`

Luxe collection card:
- Raheja Waterfront Villas → `Raheja Waterfront.jpeg`

Director page:
- `director.png`

## Still needed as images (currently PDFs → fall back to a gradient)

These three only exist as PDFs and cannot be used as backgrounds. Export them to JPG/PNG,
drop them in here, then set the matching `image:` field in `src/data/brandWallContent.js`:
- Raheja Avana (luxe collection card) — `Raheja Avana.pdf`
- Raheja Prive (luxe collection card) — `Raheja Prive.pdf`
- Raheja Riveria (featured + all-projects cards) — `Raheja Riviera.pdf`

## Unused images available

- `NIRWANA 2.jpg`, `NIRWANA 3.JPG` (entrance gates)
- `NIRWANA CLUB HOUSE.jpg` (used), `NIRWANA CLUB HOUSE(2).jpg` (unused)
- `RAHEJA GREENS PHASE 2.png`

## Duplicate files (same content as above, can be ignored)

- `ENTRANCE GATE FOR NIRWANA 1.png` = `NIRWANA 1.png`
- `ENTRANCE GATE FOR NIRWANA 2.jpg` = `NIRWANA 2.jpg`
- `ENTRANCE GATE FOR NIRWANA 3.JPG` = `NIRWANA 3.JPG`
- `RAHEJA AMBARA/ENTRANCE GATE.jpg` = `RAHEJA AMBARA.jpg`

## Notes

- The kiosk runs the Vite **dev server** (`npm run dev`, port 8000), which serves this
  root `assets/` folder directly. A production build (`npm run build` / `npm run preview`)
  does **not** copy these files — for that, move images to a `public/assets/` folder.
