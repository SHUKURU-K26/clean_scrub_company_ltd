import api from './api';
import { camelize } from '../utils/normalize';

export async function getDashboardStats() {
  const { data } = await api.get('/dashboard/summary');
  return camelize(data);
}