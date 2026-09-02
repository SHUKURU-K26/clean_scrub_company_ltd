import { z } from 'zod';

export const stockInSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().int('Must be a whole number').positive('Quantity must be greater than 0'),
  supplier: z.string().min(2, 'Supplier is required'),
  date: z.string().min(1, 'Date is required'),
});

export const stockOutSchema = z
  .object({
    productId: z.string().min(1, 'Select a product'),
    quantity: z.coerce.number().int('Must be a whole number').positive('Quantity must be greater than 0'),
    customerMode: z.enum(['existing', 'new']),
    customerId: z.string().optional(),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerType: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
  })
  .superRefine((data, ctx) => {
    if (data.customerMode === 'existing' && !data.customerId) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select a customer', path: ['customerId'] });
    }
    if (data.customerMode === 'new') {
      if (!data.customerName || data.customerName.length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Customer name is required', path: ['customerName'] });
      }
      if (!data.customerPhone || data.customerPhone.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Valid phone number is required', path: ['customerPhone'] });
      }
      if (!data.customerType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select client type', path: ['customerType'] });
      }
    }
  });