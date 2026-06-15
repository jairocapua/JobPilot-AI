import posthog from "posthog-js";

export function initPostHog(): void {
  if (typeof window === "undefined") return;
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    capture_pageview: false,
    person_profiles: "identified_only",
  });
}

export function resetPostHog(): void {
  posthog.reset();
}

export { posthog };
