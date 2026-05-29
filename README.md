# baja-client-auth-demo

A minimal browser app (Vite + React) that uses [`baja-client`](../baja-client)
to sign in via OAuth (Authorization Code + PKCE) and call the Baja Fulfillment
public API. Use it to test the flow locally and as a reference for third-party
developers.

## Setup

1. **Register an app** in the dashboard → **Public API → Browser apps →
   Register app**:
   - Type: `public`
   - Redirect URI: `http://localhost:5180/callback`
   - Scopes: `openid`, `profile`, `public_api:read`
2. **Provision an end-user account** in the same page (or reuse the seeded
   `dev@bajafulfillment.com` / `password123`) — that's who you log in as.
3. Copy `.env.example` to `.env` and paste the `client_id`:
   ```bash
   cp .env.example .env
   # set VITE_CLIENT_ID=app_…
   ```
4. Build the SDK and start the demo:
   ```bash
   pnpm -C ../baja-client build   # produces baja-client/dist
   pnpm install
   pnpm dev                        # http://localhost:5180
   ```

> The SDK is consumed via `file:../baja-client`, so build it once (or run
> `pnpm -C ../baja-client dev` to rebuild on change).

## What it shows

- **Sign in with Baja** → redirects to the BF login + consent screens, then back
  to `/callback`, which exchanges the code for tokens.
- Once signed in: call `whoami()`, `ping()`, and `getAccessToken()` and see the
  results. Tokens are refreshed transparently; **Log out** clears the session.

## How it's wired

- `src/baja.ts` — the single `BajaClient` instance, configured from `.env`.
- `src/useAuth.ts` — a tiny React hook mirroring the SDK's auth state (the SDK
  itself is framework-agnostic).
- `src/App.tsx` — home screen + the `/callback` handler.

## Consuming the published SDK (staging / production)

Locally the demo links the SDK from source via `"baja-client": "file:../baja-client"`.
To run it as a real consumer (installing `baja-client` from the registry),
change **one line** in `package.json` — the import paths stay identical because
the package name is the same:

```diff
- "baja-client": "file:../baja-client",
+ "baja-client": "^0.1.0",
```

Then `npm install` pulls it from the registry. To verify the published artifact
**before** publishing, install the packed tarball instead:

```bash
pnpm -C ../baja-client pack            # → baja-client-0.1.0.tgz
npm install ../baja-client/baja-client-0.1.0.tgz
```

### Staging config

1. Register a **public** client in the staging dashboard with redirect URI =
   your deployed demo URL + `/callback` (e.g. `https://demo.staging.example.com/callback`).
2. Point `.env` at staging:
   ```
   VITE_BF_API_URL=https://api.staging.bajafulfillment.com
   VITE_CLIENT_ID=app_…
   VITE_REDIRECT_URI=https://demo.staging.example.com/callback
   VITE_SCOPES=openid profile public_api:read
   ```
3. `pnpm build` → deploy the static `dist/` to any host. CORS is already open
   for `/oauth/token` + `/public/*`, so the demo's origin doesn't need allow-listing.

> Vite inlines `VITE_*` vars at build time, so build with the staging `.env`
> (or CI env) in place — they are not read at runtime.
