import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(1, 'Select a category'),
  unit: z.string().min(1, 'Unit is required (e.g. pcs, box, litre)'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level cannot be negative'),
  unitPrice: z.coerce.number().min(0, 'Unit price cannot be negative'),
});