import api from './api';
import { camelize, snakeize } from './../utils/normalize';

export async function updateProfileRequest(data) {
  const { data: res } = await api.put('/users/me', snakeize(data));
  return camelize(res);
}

export async function changePasswordRequest({ currentPassword, newPassword }) {
  const { data } = await api.post('/users/me/change-password', snakeize({ currentPassword, newPassword }));
  return camelize(data);
}

export async function resetAuthenticatorRequest() {
  const { data } = await api.post('/users/me/reset-authenticator');
  return camelize(data);
}

export async function regenerateRecoveryCodesRequest() {
  const { data } = await api.post('/users/me/regenerate-recovery-codes');
  return camelize(data);
}

export async function getRecoveryCodesCountRequest() {
  const { data } = await api.get('/users/me/recovery-codes-count');
  return camelize(data);
}