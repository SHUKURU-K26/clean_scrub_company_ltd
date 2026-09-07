import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Enter a valid phone number'),
  type: z.string().min(1, 'Select a client type'),
});