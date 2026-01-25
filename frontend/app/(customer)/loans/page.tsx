"use client";

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  FileText, 
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import DashboardLayout from '../components/DashboardLayout';

interface LoanType {
  id: string;
  name: string;
  description: string;
  minimum_amount: number;
  maximum_amount: number;
  minimum_interest_rate: number;
  maximum_interest_rate: number;
  minimum_tenure_months: number;
  maximum_tenure_months: number;
}

interface LoanApplication {
  id: string;
  application_number: string;
  loan_type_name: string;
  requested_amount: number;
  requested_tenure_months: number;
  status: string;
  created_at: string;
  approved_amount?: number;
  approved_interest_rate?: number;
  approved_tenure_months?: number;
}

interface Loan {
  id: string;
  loan_number: string;
  loan_type_name: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  outstanding_balance: number;
  status: string;
  start_date: string;
  next_emi_date: string;
  total_paid: number;
}

export default function LoansPage() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [typesRes, applicationsRes, loansRes] = await Promise.all([
        api.get('/loans/types/'),
        api.get('/loans/applications/'),
        api.get('/loans/')
      ]);

      setLoanTypes(typesRes.data);
      setApplications(applicationsRes.data);
      setLoans(loansRes.data);
    } catch (error) {
      console.error('Error fetching loan data:', error);
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
      'CLOSED': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
      'DEFAULTED': 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
      case 'DEFAULTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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

  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.principal_amount, 0);
  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstanding_balance, 0);
  const totalPaid = loans.reduce((sum, loan) => sum + loan.total_paid, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Loan Management</h1>
            <p className="text-purple-300">Manage your loans and applications</p>
          </div>
          <Link href="/loans/apply">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              Apply for Loan
            </button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Total Loans</h3>
              <CreditCard className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">{loans.length}</div>
            <p className="text-purple-300 text-sm mt-1">Active loans</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Total Amount</h3>
              <DollarSign className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">₹{totalLoanAmount.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Principal amount</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Outstanding</h3>
              <AlertCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">₹{totalOutstanding.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Amount remaining</p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-purple-200 text-sm font-semibold">Paid Amount</h3>
              <CheckCircle className="h-5 w-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">₹{totalPaid.toLocaleString()}</div>
            <p className="text-purple-300 text-sm mt-1">Total paid</p>
          </div>
        </div>

        {/* Active Loans Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Active Loans ({loans.length})</h2>
          </div>
          
          {loans.length === 0 ? (
            <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-12 border border-purple-500/20 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Active Loans</h3>
              <p className="text-purple-300 mb-6">You don't have any active loans.</p>
              <Link href="/loans/apply">
                <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02]">
                  Apply for Loan
                </button>
              </Link>
            </div>
          ) : (
            loans.map((loan) => {
              const progress = ((loan.principal_amount - loan.outstanding_balance) / loan.principal_amount) * 100;
              
              return (
                <div key={loan.id} className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{loan.loan_type_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {getStatusIcon(loan.status)}
                          {loan.status}
                        </span>
                      </div>
                      <p className="text-purple-300 text-sm">Loan #{loan.loan_number}</p>
                    </div>
                    <Link href={`/loans/${loan.id}`}>
                      <button className="px-4 py-2 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all">
                        View Details
                      </button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Principal</p>
                      <p className="text-white font-bold text-lg">₹{loan.principal_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Outstanding</p>
                      <p className="text-white font-bold text-lg">₹{loan.outstanding_balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Monthly EMI</p>
                      <p className="text-white font-bold text-lg">₹{loan.monthly_emi.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-1">Next EMI</p>
                      <p className="text-white font-bold text-lg">{new Date(loan.next_emi_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-purple-300">Repayment Progress</span>
                      <span className="text-purple-300">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{width: `${Math.min(progress, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}