/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BF_API_URL: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_REDIRECT_URI: string;
  readonly VITE_SCOPES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
