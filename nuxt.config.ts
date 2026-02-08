export default defineNuxtConfig({
  ssr: false,
  telemetry: false,
  vite: {
    clearScreen: false,
    envPrefix: ["VITE_", "TAURI_"],
    server: {
      strictPort: true,
      host: "0.0.0.0",
    },
  },
  nitro: {
    preset: "static",
  },
});
