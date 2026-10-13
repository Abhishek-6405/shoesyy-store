export const DEMO_ACCOUNTS = [
  "admin@shoesy.demo",
  "user@shoesy.demo",
] as const;

export function isDemoAccount(email?: string | null): boolean {
  if (!email) return false;
  return DEMO_ACCOUNTS.includes(email.toLowerCase() as typeof DEMO_ACCOUNTS[number]);
}
