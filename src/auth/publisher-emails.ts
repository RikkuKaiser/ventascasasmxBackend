import { DEMO_USERS_PLAIN } from '../database/demo-users';

/** Correos autorizados para dar de alta inmuebles (usuarios internos). */
export const PUBLISHER_EMAILS: readonly string[] = DEMO_USERS_PLAIN.map((u) =>
  u.email.trim().toLowerCase(),
);

export function isPublisherEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return PUBLISHER_EMAILS.includes(email.trim().toLowerCase());
}
