"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Gift,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import DashboardLayout from '../components/DashboardLayout';

interface CreditCardType {
  id: string;
  name: string;
  description: string;
  minimum_credit_limit: number;
  maximum_credit_limit: number;
  annual_fee: number;
  interest_rate: number;
  minimum_income_requirement: number;
  reward_points_per_100: number;
}

interface CreditCardApplication {
  id: string;
  application_number: string;
  card_type_name: string;
  requested_credit_limit: number;
  annual_income: number;
  status: string;
  created_at: string;
  approved_credit_limit?: number;
}

interface CreditCard {
  id: string;
  masked_card_number: string;
  cardholder_name: string;
  card_type_name: string;
  credit_limit: number;
  available_credit: number;
  outstanding_balance: number;
  minimum_due: number;
  due_date: string;
  status: string;
  reward_points: number;
  expiry_date: string;
}

interface Transaction {
  id: string;
  transaction_type: string;
  amount: number;
  merchant_name: string;
  transaction_date: string;
  status: string;
  reward_points_earned: number;
}

export default function CreditCardsPage() {
  const [cardTypes, setCardTypes] = useState<CreditCardType[]>([]);
  const [applications, setApplications] = useState<CreditCardApplication[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesRes, applicationsRes, cardsRes, transactionsRes] = await Promise.all([
        api.get('/credit-cards/types/'),
        api.get('/credit-cards/applications/'),
        api.get('/credit-cards/'),
        api.get('/credit-cards/transactions/')
      ]);

      setCardTypes(typesRes.data);
      setApplications(applicationsRes.data);
      setCards(cardsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error fetching credit card data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
      'UNDER_REVIEW': 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      'APPROVED': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'REJECTED': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'ACTIVE': 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      'BLOCKED': 'bg-red-500/20 text-red-400 border border-red-500/30',
      'EXPIRED': 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'BLOCKED':
      case 'REJECTED':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  const blockCard = async (cardId: string) => {
    try {
      await api.post(`/credit-cards/${cardId}/block/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error blocking card:', error);
    }
  };

  const unblockCard = async (cardId: string) => {
    try {
      await api.post(`/credit-cards/${cardId}/unblock/`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error unblocking card:', error);
    }
  };

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

  const totalCreditLimit = cards.reduce((sum, card) => sum + card.credit_limit, 0);
  const totalOutstanding = cards.reduce((sum, card) => sum + card.outstanding_balance, 0);
  const totalRewards = cards.reduce((sum, card) => sum + card.reward_points, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Credit Cards</h1>
            <p className="text-purple-300">Manage your credit cards and applications</p>
          </div>
          <Link href="/credit-cards/apply">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              Apply for Card
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Active Cards</h3>
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{cards.filter(c => c.status === 'ACTIVE').length}</div>
            <p className="text-purple-300 text-sm mt-1">Total cards</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Credit Limit</h3>
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">₹{totalCreditLimit.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Total limit</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Outstanding</h3>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Amount due</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Reward Points</h3>
              <Gift className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalRewards.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Available points</p>
          </div>
        </div>

        {/* My Cards Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">My Cards ({cards.length})</h2>
          </div>
          
          {cards.length === 0 ? (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Credit Cards</h3>
              <p className="text-purple-300 mb-6">You don't have any credit cards yet.</p>
              <Link href="/credit-cards/apply">
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02]">
                  Apply for Card
                </button>
              </Link>
            </div>
          ) : (
            cards.map((card) => (
              <div key={card.id} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{card.card_type_name}</h3>
                      <p className="text-purple-100">{card.cardholder_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                      {getStatusIcon(card.status)}
                      {card.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-mono tracking-wider">
                        {showCardDetails[card.id] ? '4532 1234 5678 9876' : card.masked_card_number}
                      </p>
                      <p className="text-sm text-purple-100 mt-1">
                        Valid Thru: {new Date(card.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleCardDetails(card.id)}
                      className="p-2 text-white hover:bg-purple-500/20 rounded-lg transition-all"
                    >
                      {showCardDetails[card.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Credit Limit</p>
                      <p className="text-white font-bold text-lg">₹{card.credit_limit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Available Credit</p>
                      <p className="text-emerald-400 font-bold text-lg">₹{card.available_credit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Outstanding</p>
                      <p className="text-orange-400 font-bold text-lg">₹{card.outstanding_balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Reward Points</p>
                      <p className="text-yellow-400 font-bold text-lg">{card.reward_points.toLocaleString()}</p>
                    </div>
                  </div>

                  {card.outstanding_balance > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div>
                          <p className="text-orange-300 font-medium">
                            Minimum Due: ₹{card.minimum_due.toLocaleString()}
                          </p>
                          <p className="text-orange-400 text-sm">
                            Due Date: {new Date(card.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all">
                          Pay Now
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/credit-cards/${card.id}`}>
                      <button className="px-4 py-2 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all text-sm">
                        View Details
                      </button>
                    </Link>
                    <Link href={`/credit-cards/${card.id}/transactions`}>
                      <button className="px-4 py-2 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all text-sm">
                        Transactions
                      </button>
                    </Link>
                    {card.status === 'ACTIVE' ? (
                      <button 
                        onClick={() => blockCard(card.id)}
                        className="px-4 py-2 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all text-sm flex items-center gap-1"
                      >
                        <Lock className="h-3 w-3" />
                        Block Card
                      </button>
                    ) : (
                      <button 
                        onClick={() => unblockCard(card.id)}
                        className="px-4 py-2 border border-emerald-500/30 text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition-all text-sm flex items-center gap-1"
                      >
                        <Unlock className="h-3 w-3" />
                        Unblock Card
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        </div>
      </div>
    </DashboardLayout>
  );
}