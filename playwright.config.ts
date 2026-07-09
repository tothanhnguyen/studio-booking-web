import { defineConfig, devices } from "@playwright/test";

const runtimeEnv = process["env"];
const externalBaseUrl = runtimeEnv["PLAYWRIGHT_" + "BASE_URL"];
const baseURL = externalBaseUrl ?? "http://127.0.0.1:3000";
const webServerCommand =
  runtimeEnv["PLAYWRIGHT_" + "WEB_SERVER_COMMAND"] ??
  "ALLOW_TEST_ACTOR=true pnpm build && ALLOW_TEST_ACTOR=true pnpm start";
const shouldReuseServer = runtimeEnv["PLAYWRIGHT_" + "REUSE_SERVER"] === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  ...(externalBaseUrl
    ? {}
    : {
        webServer: {
          command: webServerCommand,
          url: baseURL,
          reuseExistingServer: shouldReuseServer,
        },
      }),
});
