import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import { productSchema } from '../../utils/productSchemas';
import { useProductStore } from '../../store/productStore';
import { CATEGORIES } from '../../data/mockData';

export default function ProductFormModal({ open, onClose, product }) {
  const isEdit = !!product;
  const addProduct = useProductStore((state) => state.addProduct);
  const updateProduct = useProductStore((state) => state.updateProduct);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    if (open) {
      reset(
        isEdit
          ? product
          : { name: '', sku: '', category: '', unit: '', quantity: 0, reorderLevel: 10, unitPrice: 0 }
      );
    }
  }, [open, isEdit, product, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateProduct(product.id, data);
        toast.success('Product updated');
      } else {
        await addProduct(data);
        toast.success('Product added');
      }
      onClose();
    } catch {
      toast.error('Something went wrong — please try again');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput label="Product name" placeholder="Industrial Mop Set" error={errors.name?.message} {...register('name')} />
          <FormInput label="SKU" placeholder="MOP-001" error={errors.sku?.message} {...register('sku')} />
          <FormSelect label="Category" options={CATEGORIES} error={errors.category?.message} {...register('category')} />
          <FormInput label="Unit" placeholder="pcs, box, litre..." error={errors.unit?.message} {...register('unit')} />
          <FormInput label="Quantity in stock" type="number" error={errors.quantity?.message} {...register('quantity')} />
          <FormInput label="Reorder level" type="number" error={errors.reorderLevel?.message} {...register('reorderLevel')} />
          <FormInput label="Unit price (RWF)" type="number" className="sm:col-span-2" error={errors.unitPrice?.message} {...register('unitPrice')} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1">{isEdit ? 'Save Changes' : 'Add Product'}</Button>
        </div>
      </form>
    </Modal>
  );
}