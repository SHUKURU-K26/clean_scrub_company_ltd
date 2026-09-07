import api from './api';
import { camelize, snakeize } from '../utils/normalize';

export async function signupRequest({ name, email, phone, password }) {
  const { data } = await api.post('/auth/signup', snakeize({ name, email, phone, password }));
  return camelize(data);
}

export async function loginRequest({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return camelize(data);
}

export async function verifyOtpSetup(code, pendingToken) {
  const { data } = await api.post('/auth/otp/verify-setup', { code }, {
    headers: { Authorization: `Bearer ${pendingToken}` },
  });
  return camelize(data);
}

export async function verifyOtpLogin(code, pendingToken) {
  const { data } = await api.post('/auth/otp/verify-login', { code }, {
    headers: { Authorization: `Bearer ${pendingToken}` },
  });
  return camelize(data);
}

export async function verifyRecoveryCodeRequest(recoveryCode, pendingToken) {
  const { data } = await api.post('/auth/otp/verify-recovery', { recovery_code: recoveryCode }, {
    headers: { Authorization: `Bearer ${pendingToken}` },
  });
  return camelize(data);
}

// STUB — the backend has no password-reset endpoint yet, since it needs an
// email-sending service (SMTP/transactional API) we intentionally skipped
// earlier for cost. These keep ForgotPassword/ResetPassword functional as
// placeholders in the meantime. Replace with real api.post(...) calls if
// you add email delivery later (e.g. Resend's free tier).
export async function requestPasswordResetEmail(email) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { sent: true, email };
}

export async function resetPasswordRequest({ token, password }) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { success: true };
}