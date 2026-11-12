# ResQ mobile rebuild

A fresh, self-contained React + Vite mobile emergency-assistance prototype. No Tailwind or external icon library is required.

## Import into Vercel

Import this repository, use the **Vite** preset, leave **Root Directory** at the repository root, and deploy. Build command: `npm run build`. Output: `dist`. `package.json` is at the root and `vercel.json` is included.

## Local development

```sh
npm install
npm run dev
npm test
npm run build
```

## Included

- Full-width mobile layout with green/white gradients, Montserrat wordmark and red Q.
- Swipeable Get ResQ, Reach Me, Ambulance and Family emergency presets with accessible tap controls.
- Five-second cancellation window before each SOS or service action.
- One independent home Call 112 CTA; no repeated 112 prompts on active Get ResQ or Reach Me screens.
- Police, Fire, Medical, Disaster, Women, Child, Elderly and Report Bystander.
- Right-swipe menu, hamburger alternative, drawer closing swipe and keyboard focus handling.
- Editable MediCards, managed family profiles, invitation drafts, contacts, insurance and preferred hospitals.
- GPS accuracy, manual patient address, real OpenStreetMap embed when coordinates exist.
- Incident updates, source-attributed activity history, manual SMS/share, cancellation and reset.
- Video Stamp: permissions, 30-second recording limit, review, retake, attach, download and camera cleanup.
- Local persistence, offline indicator, reduced motion and larger-text preference.

## Important integration boundaries

This is a local front-end prototype, **not a dispatch service**. The included adapter in `src/services.js` does not send alerts, request callbacks, link accounts, upload video or contact emergency providers. The UI states these limitations. It never silently simulates an ambulance acceptance, ETA, incoming call or alert delivery.

To enable real services, replace adapter methods with authenticated backend calls and push verified provider events through `subscribeProvider`. Only a verified `en_route` event unlocks “Emergency services are reaching you.”

Phone links request the device calling interface; they do not verify a connected call. Never place real emergency calls while testing. Regional support numbers are configurable and are not invented when missing.

## Privacy

Use fictional information. LocalStorage is unencrypted and unsuitable for real patient records. Manual medical sharing is off by default. Video blobs stay in memory; metadata can survive reload, recordings cannot. Download a recording before closing or refreshing. Ending a local session does not cancel external calls or notify contacts.

## File map

- `src/App.jsx`: navigation, data editing, incident workflows and drawer.
- `src/ui.jsx`: icons, carousel, countdown, dialogs and recorder.
- `src/forms.jsx`: all editable forms.
- `src/store.js`: data model, persistence and pure helpers.
- `src/services.js`: integration adapter.
- `src/styles.css`: responsive design system.
- `tests/store.test.js`: logic tests.

## Verification status

Tests are included. GitHub Actions runs the test suite and production build on push. A successful workflow is the build verification; do not infer success before checking its result. Real-device gesture, GPS, calling and camera tests are still required.
