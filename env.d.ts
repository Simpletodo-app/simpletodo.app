/// <reference types="vite/client" />

interface ImportMetaEnv {
  GITHUB_TOKEN: string
  APPLE_ID: string
  APPLE_TEAM_ID: string
  APPLE_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
