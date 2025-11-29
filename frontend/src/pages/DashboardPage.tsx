import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Users, FileText, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
    const { data: invoices } = useQuery({
        queryKey: ['invoices'],
        queryFn: async () => (await api.get('/invoices')).data,
    });

    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => (await api.get('/customers')).data,
    });

    const totalRevenue = invoices?.reduce((acc: number, inv: any) => acc + inv.total, 0) || 0;
    const pendingInvoices = invoices?.filter((inv: any) => inv.status === 'pending').length || 0;

    const stats = [
        {
            label: 'Total Revenue',
            value: `$${totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: 'bg-gradient-to-r from-green-500 to-emerald-600',
            textColor: 'text-green-600'
        },
        {
            label: 'Total Invoices',
            value: invoices?.length || 0,
            icon: FileText,
            color: 'bg-gradient-to-r from-blue-500 to-indigo-600',
            textColor: 'text-blue-600'
        },
        {
            label: 'Total Customers',
            value: customers?.length || 0,
            icon: Users,
            color: 'bg-gradient-to-r from-purple-500 to-violet-600',
            textColor: 'text-purple-600'
        },
        {
            label: 'Pending Invoices',
            value: pendingInvoices,
            icon: TrendingUp,
            color: 'bg-gradient-to-r from-orange-500 to-red-600',
            textColor: 'text-orange-600'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <Link
                    to="/invoices/new"
                    className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-gray-200 flex items-center"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Invoice
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} text-white shadow-md`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className={`text-sm font-semibold ${stat.textColor} bg-opacity-10 px-2 py-1 rounded-full bg-gray-100`}>
                                +2.5%
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900">Recent Invoices</h2>
                        <Link to="/invoices" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {invoices?.slice(0, 5).map((inv: any) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">#{inv.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                                    {inv.customer?.name.charAt(0)}
                                                </div>
                                                {inv.customer?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${inv.total.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${inv.status === 'paid'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {(!invoices || invoices.length === 0) && (
                            <div className="p-8 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                <p>No invoices found yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-4">
                        <Link to="/invoices/new" className="block w-full p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200">
                                    <PlusIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Create New Invoice</h3>
                                    <p className="text-sm text-gray-500">Send an invoice to a customer</p>
                                </div>
                            </div>
                        </Link>
                        <Link to="/customers" className="block w-full p-4 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-4 group-hover:bg-purple-200">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">Add Customer</h3>
                                    <p className="text-sm text-gray-500">Manage your client list</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlusIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
