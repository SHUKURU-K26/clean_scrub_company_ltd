import { TOTP, Secret } from 'otpauth';

const ISSUER = 'Clean & Scrub';

// Generates a new TOTP secret + the otpauth:// URI used to render the QR code
export function generateOtpSecret(email) {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    base32Secret: secret.base32,
    uri: totp.toString(),
  };
}

// Validates a 6-digit code against a stored secret, allowing ±1 time-step
// of drift (standard practice — authenticator apps and server clocks aren't
// always perfectly in sync)
export function verifyOtpToken(base32Secret, token) {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(base32Secret),
  });

  return totp.validate({ token, window: 1 }) !== null;
}

export function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const a = Math.random().toString(36).slice(2, 6).toUpperCase();
    const b = Math.random().toString(36).slice(2, 6).toUpperCase();
    codes.push(`${a}-${b}`);
  }
  return codes;
}