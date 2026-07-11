import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  reactStrictMode: true,
};

// Chỉ bật Sentry build plugin khi có DSN (production/preview). Ở local dev không
// có DSN, `withSentryConfig` làm Turbopack dev server thoát ngay sau khi Ready,
// nên trả về config Next.js thuần.
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

const config = sentryDsn
  ? withSentryConfig(nextConfig, {
      // Stay silent locally; upload source maps only when an auth token is present.
      silent: !process.env.CI,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      widenClientFileUpload: true,
    })
  : nextConfig;

export default config;
