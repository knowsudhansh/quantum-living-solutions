export const ADMIN_SESSION_COOKIE = 'qls_admin_session';

const MINIMUM_SESSION_SECRET_LENGTH = 32;

export function getAdminSessionSecret(): string | null {
  const secret = process.env.NEXTAUTH_SECRET?.trim();
  return secret && secret.length >= MINIMUM_SESSION_SECRET_LENGTH ? secret : null;
}
