import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import Pagination from './Pagination';
import Skeleton from '../ui/Skeleton';
import { cn } from '../../utils/cn';

export default function DataTable({ columns, data, pageSize = 8, loading, onRowClick, emptyMessage = 'No results found' }) {
  const [sorting, setSorting] = useState([]);
  const [page, setPage] = useState(0);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const rows = table.getRowModel().rows;
  const pageCount = Math.ceil(rows.length / pageSize) || 1;
  const pagedRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  if (loading) {
    return (
      <div className="hidden md:block space-y-2">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 dark:border-white/10">
              {table.getFlatHeaders().map((header) => (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={cn(
                    'px-3 py-3 text-left text-xs font-semibold text-navy-400 dark:text-navy-300 uppercase tracking-wide whitespace-nowrap',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-navy-600 dark:hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      header.column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3" /> :
                      header.column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3" /> :
                      <ChevronsUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr><td colSpan={columns.length} className="text-center py-10 text-navy-400 dark:text-navy-300 text-sm">{emptyMessage}</td></tr>
            ) : (
              pagedRows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn('border-b border-navy-50 dark:border-white/5 transition-colors', onRowClick && 'cursor-pointer hover:bg-navy-50/60 dark:hover:bg-white/[0.03]')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3.5 text-navy-700 dark:text-navy-100">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} totalItems={rows.length} pageSize={pageSize} />
    </div>
  );
}