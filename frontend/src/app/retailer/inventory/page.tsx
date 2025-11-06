'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

interface InventoryItem {
  _id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  supplier: string;
  lastRestocked: string;
}

export default function RetailerInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInventory();
  }, [page]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const mockInventory: InventoryItem[] = [
        {
          _id: '1',
          productName: 'Organic Rice',
          category: 'Grains',
          quantity: 500,
          unit: 'kg',
          costPrice: 100,
          sellingPrice: 120,
          supplier: 'Rajesh Kumar',
          lastRestocked: new Date().toISOString(),
        },
        {
          _id: '2',
          productName: 'Fresh Tomatoes',
          category: 'Vegetables',
          quantity: 200,
          unit: 'kg',
          costPrice: 30,
          sellingPrice: 40,
          supplier: 'Priya Sharma',
          lastRestocked: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setInventory(mockInventory);
      setTotalPages(1);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (item: InventoryItem) => (
        <div>
          <p className="font-semibold text-gray-900">{item.productName}</p>
          <p className="text-sm text-gray-500">{item.category}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (item: InventoryItem) => (
        <span className={item.quantity < 100 ? 'text-red-600 font-medium' : 'text-gray-900'}>
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (item: InventoryItem) => (
        <div className="text-sm">
          <p className="text-gray-600">Cost: ₹{item.costPrice}</p>
          <p className="text-green-600 font-semibold">Sell: ₹{item.sellingPrice}</p>
        </div>
      ),
    },
    { key: 'supplier', label: 'Supplier', render: (item: InventoryItem) => <span className="text-gray-700">{item.supplier}</span> },
    {
      key: 'lastRestocked',
      label: 'Last Restocked',
      render: (item: InventoryItem) => <span className="text-sm text-gray-600">{new Date(item.lastRestocked).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item: InventoryItem) => (
        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm">
          Restock
        </button>
      ),
    },
  ];

  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  const lowStockItems = inventory.filter(item => item.quantity < 100).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Retail Inventory"
        description="Manage your retail store inventory"
        action={{
          label: 'Add Item',
          onClick: () => toast.info('Add item form coming soon'),
          icon: <PlusIcon className="h-5 w-5" />,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Inventory Value</p>
            <p className="text-2xl font-bold text-green-600">₹{totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
          </div>
        </div>

        <DataTable columns={columns} data={inventory} loading={loading} emptyMessage="No inventory items" />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
