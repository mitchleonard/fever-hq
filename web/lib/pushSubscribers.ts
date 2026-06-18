/**
 * Push subscribers — single-user MVP, generalized to a small fixed list
 * of named env vars (no DB). Each entry is optional; only configured ones
 * are returned.
 */
export type NamedSubscription = {
  label: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
};

const SUBSCRIBER_ENV_VARS: { label: string; envVar: string }[] = [
  { label: "wife", envVar: "WIFE_PUSH_SUBSCRIPTION_JSON" },
  { label: "tester", envVar: "TESTER_PUSH_SUBSCRIPTION_JSON" },
];

export function getPushSubscribers(): NamedSubscription[] {
  const subs: NamedSubscription[] = [];
  for (const { label, envVar } of SUBSCRIBER_ENV_VARS) {
    const raw = process.env[envVar];
    if (!raw) continue;
    try {
      const subscription = JSON.parse(raw);
      if (typeof subscription?.endpoint === "string") {
        subs.push({ label, subscription });
      }
    } catch {
      // malformed env var — skip rather than crash the cron/debug routes
    }
  }
  return subs;
}
