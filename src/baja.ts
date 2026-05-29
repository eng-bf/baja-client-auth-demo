import { BajaClient } from "baja-client";

const clientId = import.meta.env.VITE_CLIENT_ID ?? "";

/** False until VITE_CLIENT_ID is filled in — the app shows setup instructions. */
export const isConfigured = clientId.length > 0;

/**
 * The single shared SDK instance for the whole app. `null` until configured,
 * so the constructor (which requires a clientId) never throws on first run.
 */
export const baja = isConfigured
  ? new BajaClient({
      clientId,
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
      scopes: (import.meta.env.VITE_SCOPES ?? "openid profile public_api:read")
        .split(/\s+/)
        .filter(Boolean),
      baseUrl: import.meta.env.VITE_BF_API_URL,
    })
  : null;
