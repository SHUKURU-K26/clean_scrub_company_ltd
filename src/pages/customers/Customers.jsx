import { useState, useMemo } from 'react';
import { Plus, User, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import DataCardList from '../../components/tables/DataCardList';
import TableFilters from '../../components/tables/TableFilters';
import BulkActionBar from '../../components/tables/BulkActionBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CustomerFormModal from '../../components/customers/CustomerFormModal';
import CustomerDetailModal from '../../components/customers/CustomerDetailModal';
import { useCustomerStore } from '../../store/customerStore';
import { useTransactionStore } from '../../store/transactionStore';
import { withCustomerStats } from '../../services/customerService';
import { CLIENT_TYPES } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatRelative } from '../../utils/formatDate';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToExcel } from '../../utils/exportToExcel';

export default function Customers() {
  const customers = useCustomerStore((state) => state.customers);
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer);
  const deleteMultipleCustomers = useCustomerStore((state) => state.deleteMultipleCustomers);
  const transactions = useTransactionStore((state) => state.transactions);

  const customersWithStats = useMemo(() => withCustomerStats(customers, transactions), [customers, transactions]);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const filtered = useMemo(() => {
    return customersWithStats.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
      const matchesType = !type || c.type === type;
      return matchesSearch && matchesType;
    });
  }, [customersWithStats, search, type]);

  const activeFilterCount = type ? 1 : 0;

  const toggleSelect = (id) => setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleSelectAll = (ids, checked) => setSelectedIds(checked ? ids : []);
  const clearSelection = () => setSelectedIds([]);

  const handleAdd = () => { setEditingCustomer(null); setFormOpen(true); };
  const handleEdit = (c) => { setViewingCustomer(null); setEditingCustomer(c); setFormOpen(true); };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    await deleteCustomer(deletingCustomer.id);
    setDeleting(false);
    setDeletingCustomer(null);
    setViewingCustomer(null);
    toast.success('Customer deleted');
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    await deleteMultipleCustomers(selectedIds);
    setBulkDeleting(false);
    setBulkDeleteOpen(false);
    toast.success(`${selectedIds.length} customers deleted`);
    clearSelection();
  };

  const selectedRows = useMemo(() => customersWithStats.filter((c) => selectedIds.includes(c.id)), [customersWithStats, selectedIds]);
  const bulkColumns = ['Name', 'Phone', 'Type', 'Orders', 'Total Spent'];
  const bulkRows = () => selectedRows.map((c) => [c.name, c.phone, c.type, String(c.orderCount), formatCurrency(c.totalSpent)]);

  const handleBulkExportPdf = () => exportToPdf({ title: 'Customers — Selected', columns: bulkColumns, rows: bulkRows(), filename: 'customers-selected' });
  const handleBulkExportExcel = () => exportToExcel({ title: 'Customers', columns: bulkColumns, rows: bulkRows(), filename: 'customers-selected' });

  const columns = [
    {
      accessorKey: 'name',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-navy-100 dark:bg-white/10 flex items-center justify-center text-navy-600 dark:text-white font-semibold text-xs shrink-0">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-navy-800 dark:text-white">{row.original.name}</p>
            <p className="text-xs text-navy-400 dark:text-navy-300">{row.original.phone}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: 'type', header: 'Type', cell: ({ getValue }) => <Badge variant="navy" className="capitalize">{getValue()}</Badge> },
    { accessorKey: 'orderCount', header: 'Orders' },
    { accessorKey: 'totalSpent', header: 'Total Spent', cell: ({ getValue }) => <span className="font-semibold">{formatCurrency(getValue())}</span> },
    {
      accessorKey: 'lastPurchaseDate',
      header: 'Last Purchase',
      cell: ({ getValue }) => getValue() ? formatRelative(getValue()) : <span className="text-navy-300 dark:text-navy-500">—</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Customers</h1>
          <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">{customers.length} customers on record</p>
        </div>
        <Button onClick={handleAdd} className="cursor-pointer">
          <Plus className="w-4 h-4 " /> Add Customer
        </Button>
      </div>

      <div className="rounded-2xl glass p-4 sm:p-5">
        <TableFilters search={search} onSearchChange={setSearch} placeholder="Search by name or phone..." activeCount={activeFilterCount}>
          <select value={type} onChange={(e) => setType(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none capitalize">
            <option value="">All client types</option>
            {CLIENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
          </select>
        </TableFilters>

        <DataTable
          columns={columns}
          data={filtered}
          onRowClick={setViewingCustomer}
          emptyMessage="No customers match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
        />

        <DataCardList
          data={filtered}
          onCardClick={setViewingCustomer}
          emptyMessage="No customers match your filters"
          selectable
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          renderCard={(c) => (
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-navy-700 to-green-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-navy-800 dark:text-white truncate">{c.name}</p>
                  <Badge variant="navy" className="capitalize shrink-0">{c.type}</Badge>
                </div>
                <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">{c.phone}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-medium text-navy-500 dark:text-navy-300">
                    <ShoppingBag className="w-3 h-3" /> {c.orderCount} orders
                  </span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(c.totalSpent)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <CustomerFormModal open={formOpen} onClose={() => setFormOpen(false)} customer={editingCustomer} />

      <CustomerDetailModal
        open={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        customer={viewingCustomer}
        onEdit={handleEdit}
        onDelete={(c) => setDeletingCustomer(c)}
      />

      <ConfirmDialog
        open={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete this customer?"
        description={`"${deletingCustomer?.name}" will be removed. Their past transaction records will stay intact.`}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        loading={bulkDeleting}
        title={`Delete ${selectedIds.length} customers?`}
        description="Their past transaction records will stay intact."
      />

      <BulkActionBar
        count={selectedIds.length}
        onClear={clearSelection}
        onDelete={() => setBulkDeleteOpen(true)}
        onExportPdf={handleBulkExportPdf}
        onExportExcel={handleBulkExportExcel}
      />
    </div>
  );
}