# Building & Installing the Raheja Kiosk on LG webOS

The app is the existing web build packaged as an LG webOS app (`.ipk`). Same UI,
same animations — it's the webpage running in the TV's browser engine, now
loading its videos/renders from local storage so it runs offline after a
one-time download.

## What's already wired in this repo

- `vite.config.js` — `base: "./"` (relative paths for file://) and
  `build.target: "chrome63"` (webOS Chromium floor — adjust to the TV's version).
- `public/appinfo.json` — webOS app metadata (id `com.raheja.kiosk`, 1920×1080).
- `public/icon.png` — **placeholder** app icon (replace with a real 80×80 PNG).
- All asset paths are relative (work under file://).
- `src/screens/LoadingGate.jsx` — preloads videos+renders into local cache with a
  progress screen, **only in the packaged app** (web visitors are unaffected).
- `src/data/assetManifest.js` — the list of assets the app downloads.
- Videos, renders and the Galleria card resolve from the local cache when present.

## Prerequisites (one-time)

1. Free **LG Developer account**: https://developer.lge.com
2. Install **webOS Studio** (VS Code extension) — it bundles the `ares-*` CLI.
   (Or install the CLI standalone from the webOS TV SDK.)
3. On the TV: install the **Developer Mode** app from the LG Content Store,
   sign in, enable Dev Mode, and note the session key / passphrase.
4. Register the TV once:
   ```sh
   ares-setup-device          # add a device: name "tv", the TV's IP, the dev key
   ares-novacom --device tv --getkey
   ```

## Confirm the build target

Set Vite's `build.target` to the TV's webOS Chromium so React 19 runs:

| webOS | Chromium | `build.target` |
|-------|----------|----------------|
| 4.x | 53 | `chrome53` |
| 5.x | 68 | `chrome63`–`chrome68` |
| 6.x | 79 | `chrome79` |
| 22 / 23 / 24 | 87 / 94 / 108 | `chrome87`+ |

Find it on the TV: **Settings → General → About This TV → webOS version**.

## Build → package → install → launch

```sh
npm run build            # → dist/ (includes appinfo.json + icon.png at root)
ares-package ./dist      # → com.raheja.kiosk_1.0.0_all.ipk
ares-install --device tv ./com.raheja.kiosk_1.0.0_all.ipk
ares-launch  --device tv com.raheja.kiosk
ares-inspect --device tv --app com.raheja.kiosk --open   # remote DevTools
```

Convenience scripts are in `package.json` (`npm run webos:package`, `webos:install`,
`webos:launch`, `webos:inspect`) — they assume a device named per `ares-setup-device`.

## First launch

- Must be **online** the first time: the loading screen downloads ~2 GB of
  videos + renders into local storage (progress shown). After that the app runs
  **fully offline**; later launches skip straight in.
- Ensure the TV has **≥ 2.5 GB free** internal storage.

## Before release (checklist)

- [ ] Replace `public/icon.png` with a real **80×80** (and a 130×130 large) icon.
- [ ] Set `build.target` to the confirmed webOS version.
- [ ] Set the TV to **boot into the app** and **disable screen sleep**
      (webOS kiosk/digital-signage settings, or LG's commercial-mode tools).
- [ ] On-device pass: confirm the 4K walkthrough decodes smoothly; if it stutters,
      a `+faststart` remux (no quality loss) is the only lever that keeps full
      quality.
