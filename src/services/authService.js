// Stub implementations — simulate the FastAPI /auth/* endpoints.
// Swap each function body for a real axios call once the backend exists;
// nothing that calls these needs to change on the page side.

export async function loginRequest({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (password.length < 6) throw new Error('Invalid email or password');
  return { id: 'usr_001', name: email.split('@')[0], email, role: 'admin' };
}

export async function signupRequest({ name, email }) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { id: `usr_${Date.now()}`, name, email, role: 'admin' };
}

export async function requestPasswordResetEmail(email) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { sent: true, email };
}

export async function resetPasswordRequest({ token, password }) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { success: true };
}