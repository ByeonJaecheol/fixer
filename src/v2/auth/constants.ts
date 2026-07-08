export const V2_LOGIN_PATH = '/v2/login';
export const V2_SIGNUP_PATH = '/v2/signup';
export const V2_CHECK_EMAIL_PATH = '/v2/signup/check-email';
export const V2_PRIVATE_PATH = '/private/v2';
export const AUTH_CALLBACK_PATH = '/auth/callback';

export function getAuthCallbackUrl(next = V2_PRIVATE_PATH): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent(next)}`;
}
