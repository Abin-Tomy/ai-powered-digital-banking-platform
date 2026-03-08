"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Zap, 
  Droplet, 
  Flame, 
  Smartphone, 
  Wifi, 
  Shield, 
  Book, 
  Building,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Star,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BillerCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  biller_count: number;
}

interface Biller {
  id: string;
  name: string;
  category_name: string;
  category_icon: string;
  biller_code: string;
  description: string;
  min_amount: number;
  max_amount: number;
  convenience_fee_percentage: number;
  is_instant_payment: boolean;
}

interface SavedBiller {
  id: string;
  biller_name: string;
  nickname: string;
  customer_id: string;
  category_name: string;
  category_icon: string;
  is_favorite: boolean;
  is_autopay_enabled: boolean;
  pending_bills_count: number;
  created_at: string;
}

interface Bill {
  id: string;
  saved_biller_nickname: string;
  biller_name: string;
  category_name: string;
  bill_date: string;
  due_date: string;
  total_amount: number;
  outstanding_amount: number;
  status: string;
  is_overdue: boolean;
  days_until_due: number;
}

interface RecentPayment {
  id: string;
  payment_reference: string;
  saved_biller_nickname: string;
  biller_name: string;
  amount: number;
  status: string;
  initiated_at: string;
}

interface DashboardData {
  summary: {
    saved_billers_count: number;
    pending_bills_count: number;
    recent_payments_count: number;
    active_recurring_count: number;
  };
  recent_bills: Bill[];
  recent_payments: RecentPayment[];
}

export default function BillPaymentsPage() {
  const [categories, setCategories] = useState<BillerCategory[]>([]);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [savedBillers, setSavedBillers] = useState<SavedBiller[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [categoriesRes, billersRes, savedBillersRes, dashboardRes] = await Promise.all([
        api.get('/bill-payments/categories/'),
        api.get('/bill-payments/billers/'),
        api.get('/bill-payments/saved-billers/'),
        api.get('/bill-payments/dashboard/')
      ]);

      setCategories(categoriesRes.data);
      setBillers(billersRes.data);
      setSavedBillers(savedBillersRes.data);
      setDashboardData(dashboardRes.data);
    } catch {
      // error handled silently
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      'zap': Zap,
      'droplet': Droplet,
      'flame': Flame,
      'smartphone': Smartphone,
      'wifi': Wifi,
      'shield': Shield,
      'book': Book,
      'building': Building
    };
    const IconComponent = icons[iconName] || Building;
    return <IconComponent className="h-6 w-6" />;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'UNPAID': 'bg-yellow-100 text-yellow-800',
      'OVERDUE': 'bg-red-100 text-red-800',
      'PAID': 'bg-green-100 text-green-800',
      'PARTIALLY_PAID': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'FAILED': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE':
      case 'FAILED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredBillers = billers.filter(biller => {
    const matchesSearch = biller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || biller.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bill Payments</h1>
            <p className="text-purple-300">Pay your bills quickly and securely</p>
          </div>
          <Link href="/bill-payments/pay">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              Pay Bill
            </button>
          </Link>
        </div>

        {/* Dashboard Summary */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-purple-300">Saved Billers</h3>
                <Building className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{dashboardData.summary.saved_billers_count}</div>
              <p className="text-sm text-purple-300">Total billers</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-purple-300">Pending Bills</h3>
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">{dashboardData.summary.pending_bills_count}</div>
              <p className="text-sm text-purple-300">Due for payment</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-purple-300">Recent Payments</h3>
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{dashboardData.summary.recent_payments_count}</div>
              <p className="text-sm text-purple-300">This month</p>
            </div>

            <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-purple-300">AutoPay Active</h3>
                <Calendar className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">{dashboardData.summary.active_recurring_count}</div>
              <p className="text-sm text-purple-300">Recurring payments</p>
            </div>
          </div>
        )}

        {/* Main Content Sections */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pending Bills */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Pending Bills
              </h3>
              <p className="text-purple-300">Bills that need your attention</p>
            </div>
            <div className="p-6">
              {dashboardData && dashboardData.recent_bills.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent_bills.slice(0, 5).map((bill) => (
                    <div key={bill.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{bill.saved_biller_nickname}</p>
                        <p className="text-sm text-purple-300">{bill.biller_name}</p>
                        <p className="text-sm text-slate-400">
                          Due: {formatDate(bill.due_date)} 
                          {bill.is_overdue && <span className="text-red-400 ml-2">(Overdue)</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatCurrency(bill.outstanding_amount)}</p>
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                          bill.status === 'OVERDUE' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                          bill.status === 'UNPAID' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-purple-300">All bills are up to date!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
            <div className="p-6 border-b border-purple-500/20">
              <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Recent Payments
              </h3>
              <p className="text-purple-300">Your latest bill payments</p>
            </div>
            <div className="p-6">
              {dashboardData && dashboardData.recent_payments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent_payments.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{payment.saved_biller_nickname}</p>
                        <p className="text-sm text-purple-300">{payment.biller_name}</p>
                        <p className="text-sm text-slate-400">
                          {formatDate(payment.initiated_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{formatCurrency(payment.amount)}</p>
                        <span className={`px-2 py-1 text-xs rounded-full border ${
                          payment.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          payment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-purple-300">No recent payments</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Saved Billers */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-2">Saved Billers</h3>
            <p className="text-purple-300">Your frequently used billers for quick payments</p>
          </div>
          <div className="p-6">
            {savedBillers.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Saved Billers</h3>
                <p className="text-purple-300 mb-4">Save your frequently used billers for quick payments.</p>
                <Link href="/bill-payments/pay">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Add First Biller
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {savedBillers.map((biller) => (
                  <div
                    key={biller.id}
                    className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/10 hover:border-purple-400/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center">
                          {getCategoryIcon(biller.category_icon)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {biller.nickname}
                          </h4>
                          <p className="text-sm text-purple-300">{biller.biller_name}</p>
                        </div>
                      </div>
                      <Star className="h-4 w-4 text-yellow-400" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">
                        Account: {biller.customer_id}
                      </span>
                      <Link
                        href={`/bill-payments/pay?biller=${biller.id}`}
                        className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded border border-purple-500/30 hover:bg-purple-600/30 transition-colors"
                      >
                        Pay Now
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-2">Biller Categories</h3>
            <p className="text-purple-300">Find billers by category</p>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 bg-slate-800/50 rounded-xl border border-purple-500/10 hover:border-purple-400/30 transition-all cursor-pointer group"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-lg flex items-center justify-center text-purple-400">
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                        {category.name}
                      </h4>
                      <p className="text-sm text-purple-300">{category.biller_count} billers</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}