import { Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, PlusCircle, Settings } from 'lucide-react';

export function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-green-600">InvoiceGen</h1>
                </div>
                <nav className="mt-6 flex-1">
                    <Link
                        to="/"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        to="/customers"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                        <Users className="w-5 h-5 mr-3" />
                        Customers
                    </Link>
                    <Link
                        to="/invoices"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                        <FileText className="w-5 h-5 mr-3" />
                        Invoices
                    </Link>
                    <Link
                        to="/invoices/new"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                        <PlusCircle className="w-5 h-5 mr-3" />
                        Create Invoice
                    </Link>
                    <Link
                        to="/settings"
                        className="flex items-center px-6 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600"
                    >
                        <Settings className="w-5 h-5 mr-3" />
                        Settings
                    </Link>
                </nav>
                <div className="p-6 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-gray-600 hover:text-red-600"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}
