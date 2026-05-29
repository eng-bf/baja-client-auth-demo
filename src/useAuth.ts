import { useCallback, useEffect, useState } from "react";
import type { BajaClient, WhoAmIResponse } from "baja-client";

/**
 * Minimal React binding for the SDK. The SDK itself is framework-agnostic —
 * this hook just mirrors its auth state into React and exposes the actions.
 */
export function useAuth(client: BajaClient) {
  const [authenticated, setAuthenticated] = useState(() =>
    client.isAuthenticated(),
  );
  const [user, setUser] = useState<WhoAmIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (!client.isAuthenticated()) {
      setAuthenticated(false);
      setUser(null);
      return;
    }
    try {
      const me = await client.whoami();
      setUser(me);
      setAuthenticated(true);
      setError(null);
    } catch (e) {
      // e.g. refresh token expired/revoked — treat as signed out.
      setAuthenticated(false);
      setUser(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [client]);

  useEffect(() => {
    void loadUser();
  }, [loadUser]);

  const login = useCallback(() => client.loginWithRedirect(), [client]);

  const logout = useCallback(() => {
    client.logout();
    setAuthenticated(false);
    setUser(null);
  }, [client]);

  return { authenticated, user, error, login, logout, reload: loadUser };
}
