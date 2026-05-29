import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server port is fixed so the OAuth redirect URI
// (http://localhost:5180/callback) stays stable and matches the one you
// register for the client in the BF developer portal.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
});
