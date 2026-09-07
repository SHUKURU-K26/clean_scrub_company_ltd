import { useState, useMemo, useEffect } from 'react';
import { Plus, Package, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import DataTable from '../../components/tables/DataTable';
import DataCardList from '../../components/tables/DataCardList';
import TableFilters from '../../components/tables/TableFilters';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import ProductFormModal from '../../components/products/ProductFormModal';
import ProductDetailModal from '../../components/products/ProductDetailModal';
import { useProductStore } from '../../store/productStore';
import { CATEGORIES } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatCurrency';

export default function Products() {
  const products = useProductStore((state) => state.products);
  const loading = useProductStore((state) => state.loading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  useEffect(() => {
    fetchProducts().catch((err) => toast.error(err.message || 'Failed to load products'));
  }, [fetchProducts]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || p.category === category;
      const matchesLowStock = !lowStockOnly || p.quantity <= p.reorderLevel;
      return matchesSearch && matchesCategory && matchesLowStock;
    });
  }, [products, search, category, lowStockOnly]);

  const activeFilterCount = (category ? 1 : 0) + (lowStockOnly ? 1 : 0);
  const emptyMessage = products.length === 0 ? 'No products yet — add your first one to get started' : 'No products match your filters';

  const handleEdit = (product) => { setViewingProduct(null); setEditingProduct(product); setFormOpen(true); };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setDeletingProduct(null);
      setViewingProduct(null);
      toast.success('Product deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Product',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-navy-800 dark:text-white">{row.original.name}</p>
          <p className="text-xs text-navy-400 dark:text-navy-300">{row.original.sku}</p>
        </div>
      ),
    },
    { accessorKey: 'category', header: 'Category', cell: ({ getValue }) => <Badge variant="navy">{getValue()}</Badge> },
    {
      accessorKey: 'quantity',
      header: 'Stock',
      cell: ({ row }) => {
        const low = row.original.quantity <= row.original.reorderLevel;
        return (
          <span className="flex items-center gap-2">
            <span className="font-semibold">{row.original.quantity} {row.original.unit}</span>
            {low && <Badge variant="amber">Low</Badge>}
          </span>
        );
      },
    },
    { accessorKey: 'costPrice', header: 'Cost Price', cell: ({ getValue }) => formatCurrency(getValue()) },
    { accessorKey: 'sellingPrice', header: 'Selling Price', cell: ({ getValue }) => formatCurrency(getValue()) },
    {
      id: 'totalValue',
      header: 'Total Value',
      cell: ({ row }) => <span className="font-semibold">{formatCurrency(row.original.quantity * row.original.costPrice)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-800 dark:text-white">Products</h1>
          <p className="text-sm text-navy-400 dark:text-navy-300 mt-1">{products.length} items in your catalog</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setFormOpen(true); }} className="cursor-pointer">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="rounded-2xl glass p-4 sm:p-5">
        <TableFilters search={search} onSearchChange={setSearch} placeholder="Search by name or SKU..." activeCount={activeFilterCount}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 px-3 rounded-lg bg-white/60 dark:bg-white/5 border border-navy-100 dark:border-white/10 text-sm text-navy-700 dark:text-white outline-none">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-navy-600 dark:text-navy-200 cursor-pointer select-none px-1">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => setLowStockOnly(e.target.checked)} className="w-4 h-4 rounded accent-green-500" />
            Low stock only
          </label>
        </TableFilters>

        <DataTable columns={columns} data={filtered} loading={loading} onRowClick={setViewingProduct} emptyMessage={emptyMessage} />

        <DataCardList
          data={filtered}
          loading={loading}
          onCardClick={setViewingProduct}
          emptyMessage={emptyMessage}
          renderCard={(p) => (
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-navy-50 dark:bg-white/5 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-navy-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-navy-800 dark:text-white truncate">{p.name}</p>
                  <MoreVertical className="w-4 h-4 text-navy-300 shrink-0" />
                </div>
                <p className="text-xs text-navy-400 dark:text-navy-300 mb-2">{p.sku} · {p.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-700 dark:text-navy-100">
                    {p.quantity} {p.unit} {p.quantity <= p.reorderLevel && <Badge variant="amber" className="ml-1.5">Low</Badge>}
                  </span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(p.sellingPrice)}</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} product={editingProduct} />

      <ProductDetailModal
        open={!!viewingProduct}
        onClose={() => setViewingProduct(null)}
        product={viewingProduct}
        onEdit={handleEdit}
        onDelete={(p) => setDeletingProduct(p)}
      />

      <ConfirmDialog
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete this product?"
        description={`"${deletingProduct?.name}" will be permanently removed from your catalog.`}
      />
    </div>
  );
}