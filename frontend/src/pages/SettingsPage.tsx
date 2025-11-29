import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Save } from 'lucide-react';

export function SettingsPage() {
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { isSubmitting } } = useForm();

    const { data: user, isLoading } = useQuery({
        queryKey: ['user'],
        queryFn: async () => (await api.get('/users/me')).data,
    });

    // Reset form when user data is loaded
    if (user && !isSubmitting && !document.activeElement?.tagName.match(/INPUT|TEXTAREA/)) {
        // This is a simple way to set default values, better to use useEffect or defaultValues in useForm with data
    }

    const updateMutation = useMutation({
        mutationFn: async (data: any) => {
            return await api.patch('/users/me', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            alert('Settings saved successfully!');
        },
    });

    const onSubmit = (data: any) => {
        updateMutation.mutate(data);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Business Settings</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input
                            {...register('businessName')}
                            defaultValue={user?.businessName}
                            className="w-full border rounded-md p-2"
                            placeholder="My Awesome Business"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Phone</label>
                        <input
                            {...register('businessPhone')}
                            defaultValue={user?.businessPhone}
                            className="w-full border rounded-md p-2"
                            placeholder="+1 234 567 890"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                        <textarea
                            {...register('businessAddress')}
                            defaultValue={user?.businessAddress}
                            className="w-full border rounded-md p-2"
                            rows={3}
                            placeholder="123 Business St, City, Country"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select
                            {...register('currency')}
                            defaultValue={user?.currency || 'USD'}
                            className="w-full border rounded-md p-2 bg-white"
                        >
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="INR">INR (₹)</option>
                            <option value="GBP">GBP (£)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                        <input
                            {...register('logoUrl')}
                            defaultValue={user?.logoUrl}
                            className="w-full border rounded-md p-2"
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-gray-500 mt-1">Paste a direct link to your logo image.</p>
                    </div>
                </div>

                <div className="pt-6 border-t flex justify-end">
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
}
