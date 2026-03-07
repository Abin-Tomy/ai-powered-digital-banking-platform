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
  Clock,
  Calculator
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
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

interface EMIResult {
  emi: number;
  total_payment: number;
  total_interest: number;
  amortization_schedule: {
    month: number;
    emi: number;
    principal_component: number;
    interest_component: number;
    outstanding_balance: number;
  }[];
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

  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(12);
  const [tenure, setTenure] = useState(36);
  const [emiResult, setEmiResult] = useState<EMIResult | null>(null);
  const [emiLoading, setEmiLoading] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Debounced EMI calculation
  useEffect(() => {
    const timer = setTimeout(() => calculateEMI(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanAmount, interestRate, tenure]);

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

  const calculateEMI = async () => {
    setEmiLoading(true);
    try {
      const response = await api.post('/loans/calculate-emi/', {
        principal: loanAmount,
        annual_interest_rate: interestRate,
        tenure_months: tenure
      });
      setEmiResult(response.data);
    } catch {
      // silently ignore - user is still adjusting
    } finally {
      setEmiLoading(false);
    }
  };

  const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

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

        {/* EMI Calculator */}
        <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">EMI Calculator</h2>
              <p className="text-purple-300 text-sm">Plan your loan with instant EMI calculations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-purple-200 text-sm font-semibold">Loan Amount</label>
                  <span className="text-white font-bold">{formatINR(loanAmount)}</span>
                </div>
                <input type="range" min={10000} max={10000000} step={10000} value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
                <div className="flex justify-between text-xs text-purple-400 mt-1">
                  <span>₹10K</span><span>₹1Cr</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-purple-200 text-sm font-semibold">Interest Rate</label>
                  <span className="text-white font-bold">{interestRate}%</span>
                </div>
                <input type="range" min={5} max={24} step={0.5} value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
                <div className="flex justify-between text-xs text-purple-400 mt-1">
                  <span>5%</span><span>24%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-purple-200 text-sm font-semibold">Tenure</label>
                  <span className="text-white font-bold">{tenure} months</span>
                </div>
                <input type="range" min={6} max={84} step={6} value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-purple-500" />
                <div className="flex justify-between text-xs text-purple-400 mt-1">
                  <span>6 mo</span><span>84 mo</span>
                </div>
              </div>

              {/* Result Cards */}
              {emiResult && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-purple-500/10 text-center">
                    <div className="text-purple-300 text-xs mb-1">Monthly EMI</div>
                    <div className="text-white font-bold text-lg">{formatINR(emiResult.emi)}</div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-emerald-500/10 text-center">
                    <div className="text-purple-300 text-xs mb-1">Total Payment</div>
                    <div className="text-emerald-400 font-bold text-lg">{formatINR(emiResult.total_payment)}</div>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-4 border border-red-500/10 text-center">
                    <div className="text-purple-300 text-xs mb-1">Total Interest</div>
                    <div className="text-red-400 font-bold text-lg">{formatINR(emiResult.total_interest)}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Donut Chart */}
            <div className="flex flex-col items-center justify-center">
              {emiResult ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={[
                        { name: "Principal", value: loanAmount },
                        { name: "Interest", value: emiResult.total_interest }
                      ]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" strokeWidth={0}>
                        <Cell fill="#8b5cf6" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-purple-300 text-sm">Principal</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-purple-300 text-sm">Interest</span></div>
                  </div>
                  <Link href="/loans/apply">
                    <button className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl transition-all hover:scale-[1.02] flex items-center gap-2 text-sm">
                      <Plus className="h-4 w-4" /> Apply for This Loan
                    </button>
                  </Link>
                </>
              ) : (
                <div className="text-purple-400 text-center">
                  {emiLoading ? (
                    <svg className="animate-spin h-8 w-8 text-purple-500 mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : "Adjust sliders to calculate"}
                </div>
              )}
            </div>
          </div>

          {/* Amortization Schedule */}
          {emiResult && emiResult.amortization_schedule.length > 0 && (
            <div className="mt-6">
              <button onClick={() => setShowAmortization(!showAmortization)}
                className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors text-sm font-medium">
                <svg className={`w-4 h-4 transition-transform ${showAmortization ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                {showAmortization ? "Hide" : "Show"} Amortization Schedule
              </button>
              {showAmortization && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-purple-500/20">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80 text-purple-300">
                        <th className="px-4 py-3 text-left">Month</th>
                        <th className="px-4 py-3 text-right">EMI</th>
                        <th className="px-4 py-3 text-right">Principal</th>
                        <th className="px-4 py-3 text-right">Interest</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {emiResult.amortization_schedule.map((row) => (
                        <tr key={row.month} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2.5 text-white">{row.month}</td>
                          <td className="px-4 py-2.5 text-white text-right">{formatINR(row.emi)}</td>
                          <td className="px-4 py-2.5 text-purple-300 text-right">{formatINR(row.principal_component)}</td>
                          <td className="px-4 py-2.5 text-red-400 text-right">{formatINR(row.interest_component)}</td>
                          <td className="px-4 py-2.5 text-white text-right">{formatINR(row.outstanding_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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