# @pinpoint

A modular Pinpoint SDK for React apps. Lets users highlight elements, leave comments, and submit annotated screenshots and DOM snapshots to your server.

## Packages

| Package | Description |
|---|---|
| [`@pinpoint/shared`](./packages/shared) | Types, constants, and validators — framework-agnostic |
| [`@pinpoint/react`](./packages/react) | React SDK — `PinpointProvider`, `HighlightOverlay`, `CommentPopover`, screenshot capture, DOM serialization, and submission |
| [`@pinpoint/worker`](./packages/worker) | Cloudflare Worker backend — D1 + R2 + CF Access auth |
| [`@pinpoint/dashboard`](./packages/dashboard) | React SPA for reviewing submitted feedback |
| `@pinpoint/mock-worker` | Dev-only Cloudflare Worker that stubs the backend API |

**For agent-facing integration details, see [AGENTS.md](./AGENTS.md).**

## Quick Start

### 1. Install

```bash
pnpm add @pinpoint/react
```

### 2. Import styles

In your app entry point (e.g. `app/layout.tsx`, `src/main.tsx`):

```tsx
import "@pinpoint/react/styles.css";
```

### 3. Wrap your app

```tsx
import { PinpointProvider, usePinpoint } from "@pinpoint/react";

function PinpointButton() {
  const { isActive, toggle } = usePinpoint();
  return (
    <button
      data-pinpoint-overlay
      onClick={toggle}
      className="fixed bottom-4 right-4 z-[999990] rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {isActive ? "Close Pinpoint" : "Pinpoint"}
    </button>
  );
}

export function App() {
  return (
    <PinpointProvider endpoint="/api/v1/feedback" projectId="my-project">
      <YourApp />
      <PinpointButton />
    </PinpointProvider>
  );
}
```

That's it. Clicking the button activates Pinpoint mode — users highlight an element, leave a comment, and the SDK handles the rest.

### 4. Run the backend locally

```bash
# Start the worker (port 8787)
cd packages/worker
wrangler d1 migrations apply feedback-db --local --config wrangler.toml  # first time only
wrangler dev --config wrangler.toml --port 8787

# Start the dashboard (port 5173, proxies /api → 8787)
cd packages/dashboard
pnpm dev
```

Point the SDK at the worker:

```tsx
<PinpointProvider
  endpoint="http://localhost:8787/api/v1/feedback"
  projectId="your-project-slug"
/>
```

## API Reference

### `<PinpointProvider>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string` | — | **Required.** URL the SDK POSTs feedback to |
| `projectId` | `string` | — | **Required.** Project slug or ID (worker resolves slugs to IDs) |
| `categories` | `FeedbackCategory[]` | `['bug','suggestion','question','other']` | Category picker options |
| `captureMethod` | `'html2canvas' \| 'native'` | `'html2canvas'` | Screenshot capture method |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | UI theme |
| `exclude` | `string[]` | `[]` | CSS selectors excluded from highlighting |
| `children` | `ReactNode` | — | App content |

### `usePinpoint()`

Returns `{ isActive: boolean; toggle: () => void; config: PinpointProviderConfig }`.

### `data-pinpoint-overlay`

Add this attribute to any element that should **not** be highlighted when Pinpoint mode is active:

```tsx
<button data-pinpoint-overlay onClick={toggle}>Pinpoint</button>
```

### Exports

```ts
import { PinpointProvider, usePinpoint } from "@pinpoint/react";
import { HighlightOverlay, CommentPopover } from "@pinpoint/react";
import { captureScreenshot, serializeDOM, generateSelector, submitFeedback } from "@pinpoint/react";
import "@pinpoint/react/styles.css";
```

## Backend Contract

The SDK POSTs `multipart/form-data` to your `endpoint` with:

| Field | Type | Description |
|---|---|---|
| `metadata` | `string` (JSON) | `FeedbackMetadata` object — see `@pinpoint/shared` types |
| `screenshot` | `Blob` (PNG) | Screenshot of the selected element |
| `dom-snapshot` | `Blob` (JSON) | Serialized DOM tree of the selected element |

Your server should return `201 { id: string }` on success.

The `@pinpoint/worker` package provides a full Cloudflare Worker implementation. See [AGENTS.md](./AGENTS.md) for deployment and configuration details.

### Example server handler (Next.js App Router)

```ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const metadata = formData.get("metadata");
  const screenshot = formData.get("screenshot");
  const domSnapshot = formData.get("dom-snapshot");

  if (!metadata) {
    return NextResponse.json({ error: "metadata is required" }, { status: 400 });
  }

  // Persist to your database / object storage here

  return NextResponse.json({ id: crypto.randomUUID() }, { status: 201 });
}
```

## Screenshot Capture

The SDK uses [html2canvas-pro](https://github.com/yorickshan/html2canvas-pro) for screenshot capture, which natively supports modern CSS color functions (`lab()`, `oklch()`, `lch()`, `oklab()`) and `object-fit`.

## Monorepo Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test:run         # Run tests
pnpm typecheck        # Type check
```

### Linking locally

To use `@pinpoint/react` in another project during development, add a `link:` dependency:

```json
{
  "dependencies": {
    "@pinpoint/react": "link:./path/to/pinpoint/packages/react",
    "@pinpoint/shared": "link:./path/to/pinpoint/packages/shared"
  }
}
```

## Architecture

```
@pinpoint/shared     @pinpoint/react          @pinpoint/worker          @pinpoint/dashboard
┌─────────────┐     ┌──────────────────┐     ┌────────────────────┐   ┌─────────────────┐
│ types.ts     │◄────│ PinpointProvider   │     │ Hono CF Worker      │   │ React SPA        │
│ validators   │     │ HighlightOverlay │────▶│ D1 + R2 + Auth     │◄──│ TanStack Query    │
│ constants    │     │ CommentPopover   │     │ REST API            │   │ React Router      │
└─────────────┘     │ ScreenshotCapture│     │ Dashboard assets     │   └─────────────────┘
                     │ DOMSerializer    │     └────────────────────┘
                     │ FeedbackSubmitter│
                     └──────────────────┘
```

**Flow:** User clicks toggle → `HighlightOverlay` lets them pick an element → border-click selects it → `CommentPopover` collects comment + category → `captureScreenshot` + `serializeDOM` capture evidence → `submitFeedback` POSTs to endpoint → worker stores in D1 + R2 → dashboard reviews submissions.

## License

MIT