import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

export function CreateInvoicePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { register, control, handleSubmit, watch } = useForm({
        defaultValues: {
            items: [{ name: '', qty: 1, price: 0 }],
            customerId: '',
            taxRate: 0,
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    const { data: customers } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => (await api.get('/customers')).data,
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const token = localStorage.getItem('token');
            let userId = 'temp';
            if (token) {
                userId = JSON.parse(atob(token.split('.')[1])).id;
            }
            return await api.post('/invoices', { ...data, userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            navigate('/invoices');
        },
    });

    const items = watch('items');
    const taxRate = watch('taxRate');

    const subtotal = items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const onSubmit = (data: any) => {
        createMutation.mutate({
            customerId: data.customerId,
            items: {
                create: data.items.map((item: any) => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price
                }))
            },
            subtotal,
            tax,
            total,
            status: 'pending'
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Create New Invoice</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md">

                {/* Customer Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
                    <select
                        {...register('customerId', { required: true })}
                        className="w-full border rounded-md p-2 bg-white"
                    >
                        <option value="">-- Select a Customer --</option>
                        {customers?.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                        ))}
                    </select>
                </div>

                {/* Items List */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Items</h2>
                    <div className="space-y-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                                    <input
                                        {...register(`items.${index}.name` as const, { required: true })}
                                        className="w-full border rounded-md p-2"
                                        placeholder="Item name"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                                    <input
                                        type="number"
                                        {...register(`items.${index}.qty` as const, { valueAsNumber: true, min: 1 })}
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs text-gray-500 mb-1">Price</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register(`items.${index}.price` as const, { valueAsNumber: true, min: 0 })}
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>
                                <div className="w-24 text-right pb-2 font-medium">
                                    ${(items[index]?.qty * items[index]?.price || 0).toFixed(2)}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="pb-2 text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => append({ name: '', qty: 1, price: 0 })}
                        className="mt-4 flex items-center text-green-600 hover:text-green-800"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add Item
                    </button>
                </div>

                {/* Totals */}
                <div className="border-t pt-6 flex justify-end">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600">
                            <span>Tax Rate (%):</span>
                            <input
                                type="number"
                                {...register('taxRate', { valueAsNumber: true, min: 0 })}
                                className="w-16 border rounded-md p-1 text-right"
                            />
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Tax Amount:</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2 mt-2">
                            <span>Total:</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium"
                    >
                        Create Invoice
                    </button>
                </div>
            </form>
        </div>
    );
}
