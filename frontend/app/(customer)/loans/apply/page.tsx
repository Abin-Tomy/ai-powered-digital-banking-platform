"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calculator, FileText, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import DashboardLayout from '../../components/DashboardLayout';

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

interface ApplicationForm {
  loan_type: string;
  requested_amount: string;
  tenure_months: string;
  purpose: string;
  annual_income: string;
  employment_type: string;
  employer_name: string;
  work_experience_years: string;
  monthly_income: string;
  existing_loans_emi: string;
  collateral_details: string;
}

interface EMICalculation {
  emi: number;
  totalAmount: number;
}

function LoanApplicationInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedType = searchParams.get('type');

  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emiCalculation, setEmiCalculation] = useState<EMICalculation | null>(null);

  const [formData, setFormData] = useState<ApplicationForm>({
    loan_type: '',
    requested_amount: '',
    tenure_months: '',
    purpose: '',
    annual_income: '',
    employment_type: '',
    employer_name: '',
    work_experience_years: '',
    monthly_income: '',
    existing_loans_emi: '',
    collateral_details: ''
  });

  const [errors, setErrors] = useState<Partial<ApplicationForm>>({});

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  useEffect(() => {
    if (preSelectedType && loanTypes.length > 0) {
      const selectedType = loanTypes.find(t => t.id === preSelectedType);
      if (selectedType) {
        setFormData(prev => ({ ...prev, loan_type: preSelectedType }));
        setSelectedLoanType(selectedType);
      }
    }
  }, [preSelectedType, loanTypes]);

  const fetchLoanTypes = async () => {
    try {
      const response = await api.get('/loans/types/');
      setLoanTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Update selected loan type when type changes
    if (field === 'loan_type') {
      const type = loanTypes.find(t => t.id === value);
      setSelectedLoanType(type || null);
    }

    // Calculate EMI when amount or tenure changes
    if (field === 'requested_amount' || field === 'tenure_months') {
      setTimeout(calculateEMI, 100); // Small delay to ensure state is updated
    }
  };

  const calculateEMI = () => {
    if (!selectedLoanType || !formData.requested_amount || !formData.tenure_months) {
      setEmiCalculation(null);
      return;
    }

    const principal = parseFloat(formData.requested_amount);
    const months = parseInt(formData.tenure_months);
    const annualRate = selectedLoanType.minimum_interest_rate;
    const monthlyRate = annualRate / 12 / 100;

    if (principal > 0 && months > 0 && monthlyRate > 0) {
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                  (Math.pow(1 + monthlyRate, months) - 1);
      const totalAmount = emi * months;
      
      setEmiCalculation({ emi, totalAmount });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ApplicationForm> = {};

    if (!formData.loan_type) newErrors.loan_type = 'Please select a loan type';
    if (!formData.requested_amount) newErrors.requested_amount = 'Amount is required';
    if (!formData.tenure_months) newErrors.tenure_months = 'Tenure is required';
    if (!formData.annual_income) newErrors.annual_income = 'Annual income is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment type is required';
    if (!formData.employer_name) newErrors.employer_name = 'Employer name is required';

    // Validate amount range
    if (selectedLoanType && formData.requested_amount) {
      const amount = parseFloat(formData.requested_amount);
      if (amount < selectedLoanType.minimum_amount || amount > selectedLoanType.maximum_amount) {
        newErrors.requested_amount = `Amount must be between ₹${selectedLoanType.minimum_amount.toLocaleString()} and ₹${selectedLoanType.maximum_amount.toLocaleString()}`;
      }
    }

    // Validate tenure range
    if (selectedLoanType && formData.tenure_months) {
      const tenure = parseInt(formData.tenure_months);
      if (tenure < selectedLoanType.minimum_tenure_months || tenure > selectedLoanType.maximum_tenure_months) {
        newErrors.tenure_months = `Tenure must be between ${selectedLoanType.minimum_tenure_months} and ${selectedLoanType.maximum_tenure_months} months`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const payload = {
        ...formData,
        requested_amount: parseFloat(formData.requested_amount),
        tenure_months: parseInt(formData.tenure_months),
        annual_income: parseFloat(formData.annual_income),
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : null,
        work_experience_years: formData.work_experience_years ? parseInt(formData.work_experience_years) : null,
        existing_loans_emi: formData.existing_loans_emi ? parseFloat(formData.existing_loans_emi) : null
      };

      await api.post('/loans/applications/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      router.push('/loans?tab=applications');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      if (error.response?.data) {
        const serverErrors: Partial<ApplicationForm> = {};
        Object.keys(error.response.data).forEach(key => {
          if (key in formData) {
            serverErrors[key as keyof ApplicationForm] = Array.isArray(error.response.data[key]) 
              ? error.response.data[key][0] 
              : error.response.data[key];
          }
        });
        setErrors(serverErrors);
      }
    } finally {
      setSubmitting(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/loans">
            <button className="flex items-center gap-2 px-4 py-2 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/10 transition-all">
              <ArrowLeft className="h-4 w-4" />
              Back to Loans
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Apply for Loan</h1>
            <p className="text-purple-300 mt-1">Fill out the form to apply for a loan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Loan Type Selection */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-purple-400" />
                Loan Information
              </h3>
              <p className="text-purple-300">Select the type of loan and amount you need</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-3">
                  Loan Type *
                </label>
                <select
                  value={formData.loan_type}
                  onChange={(e) => handleInputChange('loan_type', e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                  required
                >
                  <option value="">Select loan type</option>
                  {loanTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                {errors.loan_type && (
                  <p className="text-red-400 text-sm mt-1">{errors.loan_type}</p>
                )}
              </div>

              {selectedLoanType && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                  <h4 className="text-purple-200 font-semibold mb-2">{selectedLoanType.name}</h4>
                  <p className="text-purple-300 text-sm mb-3">{selectedLoanType.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-purple-400">Amount Range:</span>
                      <span className="text-white ml-2">₹{selectedLoanType.minimum_amount.toLocaleString()} - ₹{selectedLoanType.maximum_amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-purple-400">Interest Rate:</span>
                      <span className="text-white ml-2">{selectedLoanType.minimum_interest_rate}% - {selectedLoanType.maximum_interest_rate}%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Loan Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.requested_amount}
                    onChange={(e) => handleInputChange('requested_amount', e.target.value)}
                    placeholder="Enter loan amount"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                    required
                  />
                  {errors.requested_amount && (
                    <p className="text-red-400 text-sm mt-1">{errors.requested_amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Tenure (Months) *
                  </label>
                  <input
                    type="number"
                    value={formData.tenure_months}
                    onChange={(e) => handleInputChange('tenure_months', e.target.value)}
                    placeholder="Enter tenure in months"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                    required
                  />
                  {errors.tenure_months && (
                    <p className="text-red-400 text-sm mt-1">{errors.tenure_months}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-3">
                  Purpose of Loan
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Briefly describe the purpose of this loan"
                  rows={3}
                  className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg resize-none"
                />
              </div>

              {emiCalculation && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <h4 className="text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    EMI Calculator
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-emerald-400">Monthly EMI:</span>
                      <span className="text-white ml-2 font-bold">₹{emiCalculation.emi.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                    <div>
                      <span className="text-emerald-400">Total Amount:</span>
                      <span className="text-white ml-2 font-bold">₹{emiCalculation.totalAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                Personal Information
              </h3>
              <p className="text-purple-300">Provide your financial and employment details</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Annual Income (₹) *
                  </label>
                  <input
                    type="number"
                    value={formData.annual_income}
                    onChange={(e) => handleInputChange('annual_income', e.target.value)}
                    placeholder="Enter annual income"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                    required
                  />
                  {errors.annual_income && (
                    <p className="text-red-400 text-sm mt-1">{errors.annual_income}</p>
                  )}
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Monthly Income (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) => handleInputChange('monthly_income', e.target.value)}
                    placeholder="Enter monthly income"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Employment Type *
                  </label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => handleInputChange('employment_type', e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                    required
                  >
                    <option value="">Select employment type</option>
                    <option value="SALARIED">Salaried</option>
                    <option value="SELF_EMPLOYED">Self Employed</option>
                    <option value="BUSINESS_OWNER">Business Owner</option>
                    <option value="PROFESSIONAL">Professional</option>
                  </select>
                  {errors.employment_type && (
                    <p className="text-red-400 text-sm mt-1">{errors.employment_type}</p>
                  )}
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Employer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.employer_name}
                    onChange={(e) => handleInputChange('employer_name', e.target.value)}
                    placeholder="Enter employer name"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                    required
                  />
                  {errors.employer_name && (
                    <p className="text-red-400 text-sm mt-1">{errors.employer_name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Work Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={formData.work_experience_years}
                    onChange={(e) => handleInputChange('work_experience_years', e.target.value)}
                    placeholder="Enter work experience"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-semibold mb-3">
                    Existing Loans EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.existing_loans_emi}
                    onChange={(e) => handleInputChange('existing_loans_emi', e.target.value)}
                    placeholder="Enter existing EMI amount"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-purple-200 text-sm font-semibold mb-3">
                  Collateral Details
                </label>
                <textarea
                  value={formData.collateral_details}
                  onChange={(e) => handleInputChange('collateral_details', e.target.value)}
                  placeholder="Describe any collateral you wish to provide (optional)"
                  rows={3}
                  className="w-full px-4 py-3.5 bg-slate-800/50 border-b-2 border-purple-500/50 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition-all rounded-t-lg resize-none"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link href="/loans">
              <button 
                type="button"
                className="px-6 py-3 border border-purple-500/30 text-purple-300 rounded-xl hover:bg-purple-500/10 transition-all"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 shadow-lg"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function LoanApplicationPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-10 w-10 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </DashboardLayout>
    }>
      <LoanApplicationInner />
    </Suspense>
  );
}