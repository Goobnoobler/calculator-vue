# calculator-vue

Vue 3 frontend for the [calculator-go](https://github.com/Goobnoobler/calculator-go) API. The UI collects an expression — typed, or built with the keypad — and posts it to the backend, which does the actual parsing and evaluation.

## Requirements

- Node `^22.18.0` or `>=24.12.0`
- The [calculator-go](https://github.com/Goobnoobler/calculator-go) backend, cloned as a sibling directory:

```
calculator/
  calculator-go/
  calculator-vue/
```

## Setup

```sh
npm install
npx playwright install   # browser binaries, needed once for end-to-end tests
```

## Development

```sh
npm run dev
```

Serves on `http://localhost:5173`. Vite proxies `/api` to `http://localhost:8080`, so start the backend alongside it:

```sh
cd ../calculator-go && go run .
```

Without the backend running, the UI loads but every calculation reports `Could not reach calculator backend`.

## Tests

| Command | What it runs |
| --- | --- |
| `npm run test:unit` | Vitest component tests, in watch mode |
| `npm run test:unit:run` | The same suite, once |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm test` | Unit tests then end-to-end tests |

The component tests mount `CalculatorView` with `fetch` stubbed, so they cover the UI's own behaviour — keypad entry, clearing, rendering results and errors — without a backend.

The end-to-end tests drive the real stack. Playwright starts **both** servers itself (the Go API and the Vite dev server), so they need Go on your `PATH`; it reuses either server if it is already running. Because they hit the real API, they assert the backend's own error strings rather than mocked ones.

If the backend is cloned somewhere other than the sibling path above, point Playwright at it:

```sh
CALCULATOR_BACKEND_DIR=../../some/other/path npm run test:e2e
```

Useful while writing tests:

```sh
npm run test:e2e:ui              # interactive runner
npm run test:e2e:report          # open the last HTML report
npm run test:e2e -- --project=chromium
npm run test:e2e -- --debug
```

### Browsers

Locally the suite runs on Chromium and Firefox. WebKit is added only when `CI` is set, because its Linux build links against libraries that some distributions do not package.

## Linting and formatting

```sh
npm run lint     # oxlint then eslint, both with --fix
npm run format   # prettier over src/
```

## Layout

| Path | Purpose |
| --- | --- |
| `src/views/CalculatorView.vue` | The calculator — display, keypad, and the call to `/api/calculate` |
| `src/router/` | Routes `/` to `/calculate` |
| `src/views/__tests__/` | Vitest component tests |
| `e2e/` | Playwright specs and the shared `calculator` fixture |
| `vite.config.js` | Build config and the `/api` proxy for both dev and preview |
| `playwright.config.js` | Test matrix and the two web servers |
