import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';
import AutocompleteInput from '../forms/AutocompleteInput';
import ProductSelect from '../forms/ProductSelect';
import { stockInSchema } from '../../utils/transactionSchemas';
import { useProductStore } from '../../store/productStore';
import { useTransactionStore } from '../../store/transactionStore';

const today = () => new Date().toISOString().slice(0, 10);

export default function StockInFormModal({ open, onClose, transaction }) {
  const isEdit = !!transaction;
  const products = useProductStore((state) => state.products);
  const addStockIn = useTransactionStore((state) => state.addStockIn);
  const updateStockIn = useTransactionStore((state) => state.updateStockIn);
  const suppliers = useTransactionStore((state) => state.suppliers);
  const fetchSuppliers = useTransactionStore((state) => state.fetchSuppliers);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(stockInSchema) });

  useEffect(() => {
    if (open) {
      fetchSuppliers().catch(() => {});
      reset(
        isEdit
          ? { productId: transaction.productId, quantity: transaction.quantity, supplier: transaction.supplier, date: transaction.date.slice(0, 10) }
          : { productId: '', quantity: '', supplier: '', date: today() }
      );
    }
  }, [open, isEdit, transaction, reset, fetchSuppliers]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateStockIn(transaction.id, data);
        toast.success('Entry updated');
      } else {
        await addStockIn(data);
        toast.success('Stock in recorded');
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Stock In Entry' : 'Record Stock In'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <ProductSelect label="Product" products={products} error={errors.productId?.message} {...register('productId')} />

        <div className="grid grid-cols-2 gap-4">
          <FormInput label="Quantity received" type="number" min="1" error={errors.quantity?.message} {...register('quantity')} />
          <FormInput label="Date" type="date" error={errors.date?.message} {...register('date')} />
        </div>

        <Controller
          control={control}
          name="supplier"
          render={({ field }) => (
            <AutocompleteInput
              label="Supplier"
              placeholder="Type or pick a supplier..."
              value={field.value}
              onChange={field.onChange}
              suggestions={suppliers}
              error={errors.supplier?.message}
            />
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">{isEdit ? 'Save Changes' : 'Record Stock In'}</Button>
        </div>
      </form>
    </Modal>
  );
}