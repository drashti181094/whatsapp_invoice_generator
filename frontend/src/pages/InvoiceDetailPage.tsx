import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Download, MessageCircle, CreditCard, CheckCircle } from 'lucide-react';

interface InvoiceItem {
    id: string;
    name: string;
    qty: number;
    price: number;
}

interface Customer {
    name: string;
    email: string;
    phone: string;
}

interface Invoice {
    id: string;
    customer: Customer;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: string;
    paymentStatus: string;
    paymentLink?: string;
    whatsappStatus: string;
    createdAt: string;
}

const InvoiceDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [sendingWhatsapp, setSendingWhatsapp] = useState(false);
    const [generatingLink, setGeneratingLink] = useState(false);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const checkPayment = async () => {
            const linkId = searchParams.get('razorpay_payment_link_id');


            if (linkId) {
                try {
                    // Add a small delay to allow Razorpay to update status
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    // Show verifying state if needed, or just do it in background
                    await axios.post('http://localhost:3000/payment/verify-link', { linkId });
                } catch (error) {
                    console.error('Error verifying payment:', error);
                } finally {
                    // Always fetch invoice to update UI and remove loading state
                    fetchInvoice();
                }
            } else {
                fetchInvoice();
            }
        };

        checkPayment();
    }, [id, searchParams]);

    const fetchInvoice = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/invoices/${id}`);
            setInvoice(response.data);
        } catch (error) {
            console.error('Error fetching invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await axios.post(`http://localhost:3000/invoices/${id}/export/pdf`, {}, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error('Error downloading PDF:', error);
        }
    };

    const handleSendWhatsapp = async () => {
        setSendingWhatsapp(true);
        try {
            await axios.post(`http://localhost:3000/invoices/${id}/send-whatsapp`);
            alert('WhatsApp message sent successfully!');
            fetchInvoice();
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            alert('Failed to send WhatsApp message.');
        } finally {
            setSendingWhatsapp(false);
        }
    };

    const handleCreatePaymentLink = async () => {
        setGeneratingLink(true);
        try {
            const response = await axios.post(`http://localhost:3000/invoices/${id}/pay-link`);
            if (response.data.link) {
                window.open(response.data.link, '_blank');
                fetchInvoice();
            }
        } catch (error) {
            console.error('Error creating payment link:', error);
            alert('Failed to create payment link.');
        } finally {
            setGeneratingLink(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!invoice) {
        return <div className="flex justify-center items-center h-screen">Invoice not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-900 text-white">
                    <div>
                        <Link to="/invoices" className="flex items-center text-gray-300 hover:text-white mb-2">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Invoices
                        </Link>
                        <h1 className="text-2xl font-bold">Invoice #{invoice.id.substring(0, 8)}</h1>
                        <p className="text-sm text-gray-400">Created on {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleDownloadPdf}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition"
                        >
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </button>
                        <button
                            onClick={handleSendWhatsapp}
                            disabled={sendingWhatsapp}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition disabled:opacity-50"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" /> {sendingWhatsapp ? 'Sending...' : 'WhatsApp'}
                        </button>
                    </div>
                </div>

                <div className="p-8">
                    <div className="flex justify-between mb-8">
                        <div>
                            <h3 className="text-gray-500 text-sm uppercase font-semibold">Bill To</h3>
                            <p className="text-lg font-bold text-gray-800">{invoice.customer.name}</p>
                            <p className="text-gray-600">{invoice.customer.email}</p>
                            <p className="text-gray-600">{invoice.customer.phone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-gray-500 text-sm uppercase font-semibold">Status</h3>
                            <div className="flex items-center justify-end mt-1 space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                                {invoice.whatsappStatus === 'sent' && (
                                    <span className="flex items-center text-green-600 text-xs" title="WhatsApp Sent">
                                        <CheckCircle className="w-4 h-4" />
                                    </span>
                                )}
                            </div>

                            <div className="mt-4">
                                {invoice.paymentStatus === 'paid' ? (
                                    <div className="flex items-center justify-end text-green-600 font-bold">
                                        <CheckCircle className="w-5 h-5 mr-1" /> Paid
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCreatePaymentLink}
                                        disabled={generatingLink}
                                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white transition disabled:opacity-50 ml-auto"
                                    >
                                        <CreditCard className="w-4 h-4 mr-2" /> {generatingLink ? 'Generating...' : 'Pay Now'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 text-gray-600 font-semibold">Item</th>
                                <th className="text-center py-3 text-gray-600 font-semibold">Qty</th>
                                <th className="text-right py-3 text-gray-600 font-semibold">Price</th>
                                <th className="text-right py-3 text-gray-600 font-semibold">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item) => (
                                <tr key={item.id} className="border-b border-gray-100">
                                    <td className="py-3 text-gray-800">{item.name}</td>
                                    <td className="text-center py-3 text-gray-600">{item.qty}</td>
                                    <td className="text-right py-3 text-gray-600">₹{item.price.toFixed(2)}</td>
                                    <td className="text-right py-3 text-gray-800 font-medium">₹{(item.qty * item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-64">
                            <div className="flex justify-between py-2 text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{invoice.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 text-gray-600">
                                <span>Tax</span>
                                <span>₹{invoice.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-t border-gray-200 text-xl font-bold text-gray-900 mt-2">
                                <span>Total</span>
                                <span>₹{invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetailPage;
