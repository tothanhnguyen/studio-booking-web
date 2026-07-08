import * as Sentry from "@sentry/nextjs";

import { buildSentryOptions } from "@/features/observability/sentry-options";

Sentry.init(buildSentryOptions());

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
