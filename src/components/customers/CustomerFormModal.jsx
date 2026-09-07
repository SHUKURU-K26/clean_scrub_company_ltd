import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormInput from '../forms/FormInput';
import FormSelect from '../forms/FormSelect';
import { customerSchema } from '../../utils/customerSchemas';
import { useCustomerStore } from '../../store/customerStore';
import { CLIENT_TYPES } from '../../data/mockData';

export default function CustomerFormModal({ open, onClose, customer }) {
  const isEdit = !!customer;
  const addCustomer = useCustomerStore((state) => state.addCustomer);
  const updateCustomer = useCustomerStore((state) => state.updateCustomer);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(customerSchema) });

  useEffect(() => {
    if (open) reset(isEdit ? { name: customer.name, phone: customer.phone, type: customer.type } : { name: '', phone: '', type: '' });
  }, [open, isEdit, customer, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateCustomer(customer.id, data);
        toast.success('Customer updated');
      } else {
        await addCustomer(data);
        toast.success('Customer added');
      }
           onClose();
    } catch (err) {
      toast.error(err.message || 'Something went wrong — please try again');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Customer' : 'Add Customer'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput label="Full name" placeholder="Jane Uwase" error={errors.name?.message} {...register('name')} />
        <FormInput label="Phone number" placeholder="0788123456" error={errors.phone?.message} {...register('phone')} />
        <FormSelect label="Client type" options={CLIENT_TYPES} className="capitalize" error={errors.type?.message} {...register('type')} />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="flex-1 cursor-pointer">{isEdit ? 'Save Changes' : 'Add Customer'}</Button>
        </div>
      </form>
    </Modal>
  );
}