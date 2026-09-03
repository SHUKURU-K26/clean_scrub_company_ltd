// Stubs — replace with real FastAPI calls later; page-side code won't need to change.
export async function updateProfileRequest(data) {
  await new Promise((r) => setTimeout(r, 700));
  return { ...data };
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  await new Promise((r) => setTimeout(r, 700));
  if (currentPassword.length < 6) throw new Error('Current password is incorrect');
  return { success: true };
}