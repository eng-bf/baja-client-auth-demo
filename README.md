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
