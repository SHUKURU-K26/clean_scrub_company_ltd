import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserPlus, Users } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import ProductSelect from '../forms/ProductSelect';
import CustomerSelect from '../forms/CustomerSelect';
import { stockOutSchema } from '../../utils/transactionSchemas';
import { useProductStore } from '../../store/productStore';
import { useCustomerStore } from '../../store/customerStore';
import { useTransactionStore } from '../../store/transactionStore';
import { CLIENT_TYPES } from '../../data/mockData';
import { cn } from '../../utils/cn';

const today = () => new Date().toISOString().slice(0, 10);

export default function StockOutFormModal({ open, onClose, transaction }) {
  const isEdit = !!transaction;
  const products = useProductStore((state) => state.products);
  const getProductById = useProductStore((state) => state.getProductById);
  const customers = useCustomerStore((state) => state.customers);
  const addStockOut = useTransactionStore((state) => state.addStockOut);
  const updateStockOut = useTransactionStore((state) => state.updateStockOut);

  const [customerMode, setCustomerMode] = useState('existing');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(stockOutSchema) });

  const selectedProductId = watch('productId');
  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        const customerStillExists = customers.some((c) => c.id === transaction.customerId);
        setCustomerMode('existing');
        reset({
          productId: transaction.productId,
          quantity: transaction.quantity,
          date: transaction.date.slice(0, 10),
          customerMode: 'existing',
          customerId: customerStillExists ? transaction.customerId : '',
          customerName: '', customerPhone: '', customerType: '',
        });
      } else {
        setCustomerMode('existing');
        reset({
          productId: '', quantity: '', date: today(),
          customerMode: 'existing', customerId: '', customerName: '', customerPhone: '', customerType: '',
        });
      }
    }
  }, [open, isEdit, transaction, customers, reset]);

  useEffect(() => {
    setValue('customerMode', customerMode);
  }, [customerMode, setValue]);

  const onSubmit = async (data) => {
    const available = isEdit && data.productId === transaction.productId
      ? (selectedProduct?.quantity || 0) + transaction.quantity
      : (selectedProduct?.quantity || 0);

    if (selectedProduct && data.quantity > available) {
      setError('quantity', { message: `Only ${available} ${selectedProduct.unit} available` });
      return;
    }

    const customerPayload = data.customerMode === 'existing'
      ? { customerId: data.customerId }
      : { customerName: data.customerName, customerPhone: data.customerPhone, customerType: data.customerType };

    try {
      if (isEdit) {
        await updateStockOut(transaction.id, { productId: data.productId, quantity: data.quantity, date: data.date, ...customerPayload });
        toast.success('Entry updated');
      } else {
        await addStockOut({ productId: data.productId, quantity: data.quantity, date: data.date, ...customerPayload });
        toast.success('Stock out recorded');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Stock Out Entry' : 'Record Stock Out'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ProductSelect label="Product" products={products} error={errors.productId?.message} {...register('productId')} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FormInput label="Quantity" type="number" min="1" error={errors.quantity?.message} {...register('quantity')} />
            {selectedProduct && (
              <p className="mt-1.5 text-xs text-navy-400 dark:text-navy-300">
                {isEdit && selectedProductId === transaction.productId ? selectedProduct.quantity + transaction.quantity : selectedProduct.quantity} {selectedProduct.unit} currently available
              </p>
            )}
          </div>
          <FormInput label="Date" type="date" error={errors.date?.message} {...register('date')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-600 dark:text-navy-200 mb-2">Customer</label>
          <div className="flex gap-2 p-1 rounded-xl glass mb-3 w-fit">
            <button
              type="button"
              onClick={() => setCustomerMode('existing')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors', customerMode === 'existing' ? 'bg-green-500 text-white' : 'text-navy-400 dark:text-navy-300')}
            >
              <Users className="w-3.5 h-3.5" /> Existing
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode('new')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors', customerMode === 'new' ? 'bg-green-500 text-white' : 'text-navy-400 dark:text-navy-300')}
            >
              <UserPlus className="w-3.5 h-3.5" /> New customer
            </button>
          </div>

          {customerMode === 'existing' ? (
            <CustomerSelect customers={customers} error={errors.customerId?.message} {...register('customerId')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Full name" placeholder="Jane Uwase" error={errors.customerName?.message} {...register('customerName')} />
              <FormInput label="Phone number" placeholder="0788123456" error={errors.customerPhone?.message} {...register('customerPhone')} />
              <FormSelect
                label="Client type"
                className="sm:col-span-2 capitalize"
                options={CLIENT_TYPES}
                error={errors.customerType?.message}
                {...register('customerType')}
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1 cursor-pointer">{isEdit ? 'Save Changes' : 'Record Stock Out'}</Button>
        </div>
      </form>
    </Modal>
  );
}