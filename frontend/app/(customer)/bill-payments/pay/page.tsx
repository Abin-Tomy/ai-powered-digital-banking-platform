"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ArrowLeft,
  Zap, 
  Droplet, 
  Flame, 
  Smartphone, 
  Wifi, 
  Shield, 
  Book, 
  Building,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  Clock
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

interface Account {
  id: string;
  account_number: string;
  account_type: string;
  balance?: number;
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
  parameters: BillerParameter[];
}

interface BillerParameter {
  id: string;
  name: string;
  label: string;
  parameter_type: string;
  is_required: boolean;
  validation_regex?: string;
  validation_message?: string;
  max_length?: number;
  min_length?: number;
}

interface FormData {
  biller: string;
  account: string;
  amount: number;
  parameters: Record<string, string>;
  schedulePayment: boolean;
  scheduledDate?: string;
  saveBiller: boolean;
  nickname?: string;
}

const categoryIcons: Record<string, any> = {
  electricity: Zap,
  water: Droplet,
  gas: Flame,
  mobile: Smartphone,
  broadband: Wifi,
  insurance: Shield,
  education: Book,
  government: Building
};

function BillPaymentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const billerId = searchParams.get('biller');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [biller, setBiller] = useState<Biller | null>(null);
  const [formData, setFormData] = useState<FormData>({
    biller: billerId || '',
    account: '',
    amount: 0,
    parameters: {},
    schedulePayment: false,
    saveBiller: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchAccounts();
    if (billerId) {
      fetchBiller(billerId);
      setFormData(prev => ({ ...prev, biller: billerId }));
    }
  }, [billerId]);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounts/my/');
      setAccounts(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, account: response.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  const fetchBiller = async (billerId: string) => {
    try {
      const response = await api.get(`/bill-payments/billers/${billerId}/`);
      setBiller(response.data);
    } catch (error) {
      console.error('Failed to fetch biller:', error);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.biller) newErrors.biller = 'Please select a biller';
      if (!formData.account) newErrors.account = 'Please select an account';
      if (!formData.amount || formData.amount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
      if (biller && formData.amount < biller.min_amount) {
        newErrors.amount = `Minimum amount is ₹${biller.min_amount}`;
      }
      if (biller && formData.amount > biller.max_amount) {
        newErrors.amount = `Maximum amount is ₹${biller.max_amount}`;
      }
    }

    if (stepNumber === 2 && biller) {
      biller.parameters.forEach(param => {
        const value = formData.parameters[param.name];
        if (param.is_required && (!value || value.trim() === '')) {
          newErrors[`param_${param.name}`] = `${param.label} is required`;
        } else if (value) {
          if (param.validation_regex) {
            const regex = new RegExp(param.validation_regex);
            if (!regex.test(value)) {
              newErrors[`param_${param.name}`] = param.validation_message || `Invalid ${param.label} format`;
            }
          }
          if (param.min_length && value.length < param.min_length) {
            newErrors[`param_${param.name}`] = `${param.label} must be at least ${param.min_length} characters`;
          }
          if (param.max_length && value.length > param.max_length) {
            newErrors[`param_${param.name}`] = `${param.label} must not exceed ${param.max_length} characters`;
          }
        }
      });
    }

    if (stepNumber === 3) {
      if (formData.schedulePayment && !formData.scheduledDate) {
        newErrors.scheduledDate = 'Please select a scheduled date';
      }
      if (formData.schedulePayment && formData.scheduledDate) {
        const selectedDate = new Date(formData.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate <= today) {
          newErrors.scheduledDate = 'Scheduled date must be in the future';
        }
      }
      if (formData.saveBiller && (!formData.nickname || formData.nickname.trim() === '')) {
        newErrors.nickname = 'Please provide a nickname to save the biller';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      parameters: { ...prev.parameters, [paramName]: value }
    }));
    if (errors[`param_${paramName}`]) {
      setErrors(prev => ({ ...prev, [`param_${paramName}`]: '' }));
    }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const calculateConvenienceFee = () => {
    if (!biller || !formData.amount) return 0;
    return Math.round((formData.amount * biller.convenience_fee_percentage / 100) * 100) / 100;
  };

  const calculateTotal = () => {
    return formData.amount + calculateConvenienceFee();
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const paymentData = {
        biller: formData.biller,
        account: formData.account,
        amount: formData.amount,
        parameters: formData.parameters,
        scheduled_date: formData.schedulePayment ? formData.scheduledDate : null,
        save_biller: formData.saveBiller,
        biller_nickname: formData.saveBiller ? formData.nickname : null
      };

      await api.post('/bill-payments/payments/', paymentData);
      router.push('/bill-payments?success=true');
    } catch (error: any) {
      console.error('Payment failed:', error);
      if (error.response?.data) {
        const serverErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach(key => {
          serverErrors[key] = Array.isArray(error.response.data[key]) 
            ? error.response.data[key][0] 
            : error.response.data[key];
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90); // Allow scheduling up to 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  const getCategoryIcon = (iconName: string) => {
    const IconComponent = categoryIcons[iconName] || Building;
    return IconComponent;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {!billerId && (
        <div>
          <Label className="text-white mb-3 block">Select Biller</Label>
          <div className="text-purple-300 text-sm mb-4">
            Please go back to select a biller from the bill payments dashboard.
          </div>
        </div>
      )}
      
      {biller && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
              {React.createElement(getCategoryIcon(biller.category_icon), {
                className: "w-6 h-6 text-purple-400"
              })}
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{biller.name}</h3>
              <p className="text-purple-300 text-sm">{biller.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300">Category:</span>
              <span className="text-white ml-2 capitalize">{biller.category_name}</span>
            </div>
            <div>
              <span className="text-purple-300">Payment Type:</span>
              <Badge variant={biller.is_instant_payment ? "default" : "secondary"} className="ml-2">
                {biller.is_instant_payment ? "Instant" : "Standard"}
              </Badge>
            </div>
            <div>
              <span className="text-purple-300">Amount Range:</span>
              <span className="text-white ml-2">₹{biller.min_amount} - ₹{biller.max_amount}</span>
            </div>
            <div>
              <span className="text-purple-300">Convenience Fee:</span>
              <span className="text-white ml-2">{biller.convenience_fee_percentage}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="account" className="text-white mb-2 block">Payment Account *</Label>
          <Select value={formData.account} onValueChange={(value) => handleInputChange('account', value)}>
            <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.account_number} ({account.account_type})
                  {account.balance && ` - ${formatCurrency(account.balance)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.account && <p className="text-red-400 text-sm mt-1">{errors.account}</p>}
        </div>

        <div>
          <Label htmlFor="amount" className="text-white mb-2 block">Amount *</Label>
          <Input
            id="amount"
            type="number"
            min={biller?.min_amount || 1}
            max={biller?.max_amount || 100000}
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="Enter amount"
          />
          {biller && (
            <p className="text-purple-400 text-xs mt-1">
              Range: ₹{biller.min_amount} - ₹{biller.max_amount}
            </p>
          )}
          {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
        </div>
      </div>

      {formData.amount > 0 && biller && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-emerald-500/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Payment Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-300">Bill Amount:</span>
              <span className="text-white">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-300">Convenience Fee ({biller.convenience_fee_percentage}%):</span>
              <span className="text-white">{formatCurrency(calculateConvenienceFee())}</span>
            </div>
            <div className="border-t border-purple-500/20 pt-2 flex justify-between font-semibold">
              <span className="text-white">Total Amount:</span>
              <span className="text-emerald-400">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2">Biller Information</h3>
        <p className="text-purple-300 text-sm">
          Please provide the required information for {biller?.name}
        </p>
      </div>

      {biller?.parameters.map((parameter) => (
        <div key={parameter.id}>
          <Label htmlFor={parameter.name} className="text-white mb-2 block">
            {parameter.label} {parameter.is_required && '*'}
          </Label>
          
          {parameter.parameter_type === 'select' ? (
            <Select 
              value={formData.parameters[parameter.name] || ''} 
              onValueChange={(value) => handleParameterChange(parameter.name, value)}
            >
              <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
                <SelectValue placeholder={`Select ${parameter.label}`} />
              </SelectTrigger>
              <SelectContent>
                {/* Add select options based on parameter configuration */}
                <SelectItem value="option1">Option 1</SelectItem>
                <SelectItem value="option2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={parameter.name}
              type={parameter.parameter_type === 'number' ? 'number' : 'text'}
              value={formData.parameters[parameter.name] || ''}
              onChange={(e) => handleParameterChange(parameter.name, e.target.value)}
              className="bg-slate-800/50 border-purple-500/20 text-white"
              placeholder={`Enter ${parameter.label}`}
              maxLength={parameter.max_length}
              minLength={parameter.min_length}
              required={parameter.is_required}
            />
          )}
          
          {parameter.validation_message && (
            <p className="text-purple-400 text-xs mt-1">{parameter.validation_message}</p>
          )}
          {errors[`param_${parameter.name}`] && (
            <p className="text-red-400 text-sm mt-1">{errors[`param_${parameter.name}`]}</p>
          )}
        </div>
      ))}

      {(!biller?.parameters || biller.parameters.length === 0) && (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Additional Information Required</h3>
          <p className="text-purple-300">
            This biller doesn't require any additional parameters. You can proceed to the next step.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="schedulePayment"
            checked={formData.schedulePayment}
            onChange={(e) => handleInputChange('schedulePayment', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="schedulePayment" className="text-white font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Payment for Later
          </label>
        </div>

        {formData.schedulePayment && (
          <div>
            <Label htmlFor="scheduledDate" className="text-white mb-2 block">Scheduled Date *</Label>
            <Input
              id="scheduledDate"
              type="date"
              min={getMinDate()}
              max={getMaxDate()}
              value={formData.scheduledDate || ''}
              onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
              className="bg-slate-800/50 border-purple-500/20 text-white"
            />
            {errors.scheduledDate && <p className="text-red-400 text-sm mt-1">{errors.scheduledDate}</p>}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="saveBiller"
            checked={formData.saveBiller}
            onChange={(e) => handleInputChange('saveBiller', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="saveBiller" className="text-white font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Save Biller for Quick Payments
          </label>
        </div>

        {formData.saveBiller && (
          <div>
            <Label htmlFor="nickname" className="text-white mb-2 block">Biller Nickname *</Label>
            <Input
              id="nickname"
              value={formData.nickname || ''}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              className="bg-slate-800/50 border-purple-500/20 text-white"
              placeholder="e.g., Home Electricity, Mobile Bill"
            />
            <p className="text-purple-400 text-xs mt-1">
              This nickname will help you identify this biller in saved billers
            </p>
            {errors.nickname && <p className="text-red-400 text-sm mt-1">{errors.nickname}</p>}
          </div>
        )}
      </div>

      {/* Final Payment Summary */}
      <div className="bg-slate-800/30 rounded-xl p-6 border border-emerald-500/20">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          Payment Confirmation
        </h4>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300">Biller:</span>
              <div className="text-white font-medium">{biller?.name}</div>
            </div>
            <div>
              <span className="text-purple-300">Payment Type:</span>
              <div className="text-white">
                {formData.schedulePayment ? (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    Scheduled for {formData.scheduledDate}
                  </Badge>
                ) : (
                  <Badge variant="default" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Immediate
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="border-t border-purple-500/20 pt-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300">Bill Amount:</span>
              <span className="text-white">{formatCurrency(formData.amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-purple-300">Convenience Fee:</span>
              <span className="text-white">{formatCurrency(calculateConvenienceFee())}</span>
            </div>
            <div className="flex justify-between items-center font-semibold text-lg border-t border-purple-500/20 pt-2">
              <span className="text-white">Total Amount:</span>
              <span className="text-emerald-400">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!biller && billerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white">Loading biller information...</p>
        </div>
      </div>
    );
  }

  if (!billerId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">No Biller Selected</h1>
          <p className="text-purple-300 mb-8">
            Please select a biller from the bill payments dashboard to make a payment.
          </p>
          <Link href="/bill-payments">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Go to Bill Payments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/bill-payments" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Bill Payments
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Pay Bill</h1>
          <p className="text-purple-300">Complete your bill payment securely</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-purple-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-purple-400' : 'text-slate-500'}>Payment Details</span>
            <span className={step >= 2 ? 'text-purple-400' : 'text-slate-500'}>Biller Information</span>
            <span className={step >= 3 ? 'text-purple-400' : 'text-slate-500'}>Confirm & Pay</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-2">
              {step === 1 && 'Payment Details'}
              {step === 2 && 'Biller Information'}
              {step === 3 && 'Review & Confirm'}
            </h3>
            <p className="text-purple-300">
              {step === 1 && 'Select your account and enter the payment amount'}
              {step === 2 && 'Provide required biller information'}
              {step === 3 && 'Review your payment details and confirm'}
            </p>
          </div>
          <div className="p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-purple-500/20">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={step === 1}
                className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              >
                Previous
              </Button>
              
              {step < 3 ? (
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm Payment
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function BillPayment() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    }>
      <BillPaymentInner />
    </Suspense>
  );
}