import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export function InvoicesPage() {
    const { data: invoices, isLoading } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => (await api.get('/invoices')).data,
    });



    if (isLoading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Invoices</h1>
                <Link
                    to="/invoices/new"
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Invoice
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-medium">Invoice #</th>
                            <th className="px-6 py-3 text-gray-600 font-medium">Customer</th>
                            <th className="px-6 py-3 text-gray-600 font-medium">Date</th>
                            <th className="px-6 py-3 text-gray-600 font-medium">Total</th>
                            <th className="px-6 py-3 text-gray-600 font-medium">Status</th>
                            <th className="px-6 py-3 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoices?.map((inv: any) => (
                            <tr key={inv.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">#{inv.id.slice(0, 8)}</td>
                                <td className="px-6 py-4">{inv.customer?.name}</td>
                                <td className="px-6 py-4">{new Date().toLocaleDateString()}</td>
                                <td className="px-6 py-4 font-bold">₹{inv.total.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        to={`/invoices/${inv.id}`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {invoices?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                    No invoices found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
