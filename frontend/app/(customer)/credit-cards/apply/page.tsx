"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ArrowLeft,
  CreditCard,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Gift,
  Shield,
  Star
} from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

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
  features: string[];
}

interface FormData {
  cardType: string;
  requestedCreditLimit: number;
  annualIncome: number;
  employmentType: string;
  companyName: string;
  workExperience: number;
  panNumber: string;
  aadhaarNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  monthlyExpenses: number;
  existingCreditCards: number;
  existingLoans: number;
  purpose: string;
  consentDataUsage: boolean;
  consentCreditCheck: boolean;
}

const employmentTypes = [
  'Salaried',
  'Self Employed',
  'Business Owner',
  'Professional',
  'Retired',
  'Student',
  'Homemaker'
];

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

export default function CreditCardApplication() {
  const router = useRouter();
  const [cardTypes, setCardTypes] = useState<CreditCardType[]>([]);
  const [selectedCardType, setSelectedCardType] = useState<CreditCardType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cardType: '',
    requestedCreditLimit: 50000,
    annualIncome: 0,
    employmentType: '',
    companyName: '',
    workExperience: 0,
    panNumber: '',
    aadhaarNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    monthlyExpenses: 0,
    existingCreditCards: 0,
    existingLoans: 0,
    purpose: '',
    consentDataUsage: false,
    consentCreditCheck: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchCardTypes();
  }, []);

  useEffect(() => {
    if (formData.cardType) {
      const cardType = cardTypes.find(type => type.id === formData.cardType);
      setSelectedCardType(cardType || null);
    }
  }, [formData.cardType, cardTypes]);

  const fetchCardTypes = async () => {
    try {
      const response = await api.get('/credit-cards/types/');
      setCardTypes(response.data);
    } catch (error) {
      console.error('Failed to fetch card types:', error);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNumber === 1) {
      if (!formData.cardType) newErrors.cardType = 'Please select a card type';
      if (!formData.requestedCreditLimit || formData.requestedCreditLimit < 10000) {
        newErrors.requestedCreditLimit = 'Credit limit must be at least ₹10,000';
      }
      if (selectedCardType && formData.requestedCreditLimit > selectedCardType.maximum_credit_limit) {
        newErrors.requestedCreditLimit = `Maximum limit for this card is ₹${selectedCardType.maximum_credit_limit.toLocaleString()}`;
      }
      if (!formData.annualIncome || formData.annualIncome < 100000) {
        newErrors.annualIncome = 'Annual income must be at least ₹1,00,000';
      }
      if (selectedCardType && formData.annualIncome < selectedCardType.minimum_income_requirement) {
        newErrors.annualIncome = `Minimum income required for this card is ₹${selectedCardType.minimum_income_requirement.toLocaleString()}`;
      }
    }

    if (stepNumber === 2) {
      if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (formData.workExperience < 0) newErrors.workExperience = 'Work experience cannot be negative';
      if (!formData.panNumber.trim()) newErrors.panNumber = 'PAN number is required';
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
        newErrors.panNumber = 'Invalid PAN format (e.g., ABCDE1234F)';
      }
      if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
      if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
        newErrors.aadhaarNumber = 'Aadhaar must be 12 digits';
      }
    }

    if (stepNumber === 3) {
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
      if (!/^\d{6}$/.test(formData.pincode)) {
        newErrors.pincode = 'Pincode must be 6 digits';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!/^\d{10}$/.test(formData.phone)) {
        newErrors.phone = 'Phone must be 10 digits';
      }
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    if (stepNumber === 4) {
      if (!formData.monthlyExpenses || formData.monthlyExpenses < 0) {
        newErrors.monthlyExpenses = 'Monthly expenses must be a positive number';
      }
      if (formData.existingCreditCards < 0) {
        newErrors.existingCreditCards = 'Cannot be negative';
      }
      if (formData.existingLoans < 0) {
        newErrors.existingLoans = 'Cannot be negative';
      }
      if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
      if (!formData.consentDataUsage) {
        newErrors.consentDataUsage = 'You must consent to data usage';
      }
      if (!formData.consentCreditCheck) {
        newErrors.consentCreditCheck = 'You must consent to credit check';
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

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);
    try {
      const applicationData = {
        card_type: formData.cardType,
        requested_credit_limit: formData.requestedCreditLimit,
        annual_income: formData.annualIncome,
        employment_type: formData.employmentType,
        company_name: formData.companyName,
        work_experience_years: formData.workExperience,
        pan_number: formData.panNumber,
        aadhaar_number: formData.aadhaarNumber,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        monthly_expenses: formData.monthlyExpenses,
        existing_credit_cards_count: formData.existingCreditCards,
        existing_loans_count: formData.existingLoans,
        purpose: formData.purpose
      };

      await api.post('/credit-cards/applications/create/', applicationData);
      router.push('/credit-cards?tab=applications&success=true');
    } catch (error: any) {
      console.error('Application submission failed:', error);
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="cardType" className="text-white mb-3 block">Select Card Type *</Label>
        <div className="grid gap-4">
          {cardTypes.map((cardType) => (
            <div
              key={cardType.id}
              className={`border rounded-xl p-4 cursor-pointer transition-all ${
                formData.cardType === cardType.id
                  ? 'border-purple-400 bg-purple-500/10'
                  : 'border-purple-500/20 hover:border-purple-400/40'
              }`}
              onClick={() => handleInputChange('cardType', cardType.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{cardType.name}</h3>
                    <p className="text-purple-300 text-sm">{cardType.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  {formatCurrency(cardType.annual_fee)} Annual Fee
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-purple-300">Credit Limit</div>
                  <div className="text-white font-medium">
                    {formatCurrency(cardType.minimum_credit_limit)} - {formatCurrency(cardType.maximum_credit_limit)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-purple-300">Interest Rate</div>
                  <div className="text-white font-medium">{cardType.interest_rate}% p.a.</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-300">Min Income</div>
                  <div className="text-white font-medium">{formatCurrency(cardType.minimum_income_requirement)}</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-300">Rewards</div>
                  <div className="text-white font-medium">{cardType.reward_points_per_100} pts/₹100</div>
                </div>
              </div>
              
              {cardType.features && cardType.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {cardType.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {cardType.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{cardType.features.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {errors.cardType && <p className="text-red-400 text-sm mt-1">{errors.cardType}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="requestedCreditLimit" className="text-white mb-2 block">
            Requested Credit Limit *
          </Label>
          <Input
            id="requestedCreditLimit"
            type="number"
            min="10000"
            max={selectedCardType?.maximum_credit_limit || 1000000}
            value={formData.requestedCreditLimit}
            onChange={(e) => handleInputChange('requestedCreditLimit', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="50000"
          />
          {selectedCardType && (
            <p className="text-purple-400 text-xs mt-1">
              Range: {formatCurrency(selectedCardType.minimum_credit_limit)} - {formatCurrency(selectedCardType.maximum_credit_limit)}
            </p>
          )}
          {errors.requestedCreditLimit && <p className="text-red-400 text-sm mt-1">{errors.requestedCreditLimit}</p>}
        </div>

        <div>
          <Label htmlFor="annualIncome" className="text-white mb-2 block">
            Annual Income *
          </Label>
          <Input
            id="annualIncome"
            type="number"
            min="100000"
            value={formData.annualIncome}
            onChange={(e) => handleInputChange('annualIncome', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="500000"
          />
          {selectedCardType && (
            <p className="text-purple-400 text-xs mt-1">
              Minimum required: {formatCurrency(selectedCardType.minimum_income_requirement)}
            </p>
          )}
          {errors.annualIncome && <p className="text-red-400 text-sm mt-1">{errors.annualIncome}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="employmentType" className="text-white mb-2 block">Employment Type *</Label>
          <Select value={formData.employmentType} onValueChange={(value) => handleInputChange('employmentType', value)}>
            <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
              <SelectValue placeholder="Select employment type" />
            </SelectTrigger>
            <SelectContent>
              {employmentTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.employmentType && <p className="text-red-400 text-sm mt-1">{errors.employmentType}</p>}
        </div>

        <div>
          <Label htmlFor="workExperience" className="text-white mb-2 block">Work Experience (Years)</Label>
          <Input
            id="workExperience"
            type="number"
            min="0"
            max="50"
            value={formData.workExperience}
            onChange={(e) => handleInputChange('workExperience', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="5"
          />
          {errors.workExperience && <p className="text-red-400 text-sm mt-1">{errors.workExperience}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="companyName" className="text-white mb-2 block">Company Name *</Label>
        <Input
          id="companyName"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          className="bg-slate-800/50 border-purple-500/20 text-white"
          placeholder="ABC Technologies Pvt Ltd"
        />
        {errors.companyName && <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="panNumber" className="text-white mb-2 block">PAN Number *</Label>
          <Input
            id="panNumber"
            value={formData.panNumber}
            onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
          {errors.panNumber && <p className="text-red-400 text-sm mt-1">{errors.panNumber}</p>}
        </div>

        <div>
          <Label htmlFor="aadhaarNumber" className="text-white mb-2 block">Aadhaar Number *</Label>
          <Input
            id="aadhaarNumber"
            value={formData.aadhaarNumber}
            onChange={(e) => handleInputChange('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="123456789012"
            maxLength={12}
          />
          {errors.aadhaarNumber && <p className="text-red-400 text-sm mt-1">{errors.aadhaarNumber}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="address" className="text-white mb-2 block">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="bg-slate-800/50 border-purple-500/20 text-white"
          placeholder="Enter your complete address"
          rows={3}
        />
        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="city" className="text-white mb-2 block">City *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="Mumbai"
          />
          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
        </div>

        <div>
          <Label htmlFor="state" className="text-white mb-2 block">State *</Label>
          <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
            <SelectTrigger className="bg-slate-800/50 border-purple-500/20 text-white">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>{state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
        </div>

        <div>
          <Label htmlFor="pincode" className="text-white mb-2 block">Pincode *</Label>
          <Input
            id="pincode"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value.replace(/\D/g, ''))}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="400001"
            maxLength={6}
          />
          {errors.pincode && <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="phone" className="text-white mb-2 block">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="9876543210"
            maxLength={10}
          />
          {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="email" className="text-white mb-2 block">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="user@example.com"
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="monthlyExpenses" className="text-white mb-2 block">Monthly Expenses *</Label>
          <Input
            id="monthlyExpenses"
            type="number"
            min="0"
            value={formData.monthlyExpenses}
            onChange={(e) => handleInputChange('monthlyExpenses', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="25000"
          />
          {errors.monthlyExpenses && <p className="text-red-400 text-sm mt-1">{errors.monthlyExpenses}</p>}
        </div>

        <div>
          <Label htmlFor="existingCreditCards" className="text-white mb-2 block">Existing Credit Cards</Label>
          <Input
            id="existingCreditCards"
            type="number"
            min="0"
            max="10"
            value={formData.existingCreditCards}
            onChange={(e) => handleInputChange('existingCreditCards', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="2"
          />
          {errors.existingCreditCards && <p className="text-red-400 text-sm mt-1">{errors.existingCreditCards}</p>}
        </div>

        <div>
          <Label htmlFor="existingLoans" className="text-white mb-2 block">Existing Loans</Label>
          <Input
            id="existingLoans"
            type="number"
            min="0"
            max="10"
            value={formData.existingLoans}
            onChange={(e) => handleInputChange('existingLoans', parseInt(e.target.value) || 0)}
            className="bg-slate-800/50 border-purple-500/20 text-white"
            placeholder="1"
          />
          {errors.existingLoans && <p className="text-red-400 text-sm mt-1">{errors.existingLoans}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="purpose" className="text-white mb-2 block">Purpose for Credit Card *</Label>
        <Textarea
          id="purpose"
          value={formData.purpose}
          onChange={(e) => handleInputChange('purpose', e.target.value)}
          className="bg-slate-800/50 border-purple-500/20 text-white"
          placeholder="e.g., Personal expenses, Business transactions, Travel, etc."
          rows={3}
        />
        {errors.purpose && <p className="text-red-400 text-sm mt-1">{errors.purpose}</p>}
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consentDataUsage"
            checked={formData.consentDataUsage}
            onChange={(e) => handleInputChange('consentDataUsage', e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="consentDataUsage" className="text-sm text-purple-300 leading-5">
            I consent to the use of my personal data for processing this credit card application and related services. 
            I understand that my information will be used in accordance with the bank's privacy policy.
          </label>
        </div>
        {errors.consentDataUsage && <p className="text-red-400 text-sm">{errors.consentDataUsage}</p>}

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="consentCreditCheck"
            checked={formData.consentCreditCheck}
            onChange={(e) => handleInputChange('consentCreditCheck', e.target.checked)}
            className="mt-1"
          />
          <label htmlFor="consentCreditCheck" className="text-sm text-purple-300 leading-5">
            I authorize the bank to perform credit checks and verify my financial information with credit bureaus 
            and other financial institutions as necessary for this application.
          </label>
        </div>
        {errors.consentCreditCheck && <p className="text-red-400 text-sm">{errors.consentCreditCheck}</p>}
      </div>

      {/* Application Summary */}
      {selectedCardType && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-purple-500/20">
          <h4 className="text-white font-semibold mb-3">Application Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-purple-300">Card Type:</span>
              <span className="text-white ml-2">{selectedCardType.name}</span>
            </div>
            <div>
              <span className="text-purple-300">Credit Limit:</span>
              <span className="text-white ml-2">{formatCurrency(formData.requestedCreditLimit)}</span>
            </div>
            <div>
              <span className="text-purple-300">Annual Income:</span>
              <span className="text-white ml-2">{formatCurrency(formData.annualIncome)}</span>
            </div>
            <div>
              <span className="text-purple-300">Annual Fee:</span>
              <span className="text-white ml-2">{formatCurrency(selectedCardType.annual_fee)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/credit-cards" 
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Credit Cards
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Credit Card Application</h1>
          <p className="text-purple-300">Complete the form below to apply for your credit card</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-purple-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm">
            <span className={step >= 1 ? 'text-purple-400' : 'text-slate-500'}>Card Selection</span>
            <span className={step >= 2 ? 'text-purple-400' : 'text-slate-500'}>Personal Details</span>
            <span className={step >= 3 ? 'text-purple-400' : 'text-slate-500'}>Contact Info</span>
            <span className={step >= 4 ? 'text-purple-400' : 'text-slate-500'}>Final Details</span>
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-purple-500/20 rounded-xl">
          <div className="p-6 border-b border-purple-500/20">
            <h3 className="text-xl font-semibold text-white mb-2">
              {step === 1 && 'Select Credit Card & Basic Info'}
              {step === 2 && 'Employment & Identity Details'}
              {step === 3 && 'Contact Information'}
              {step === 4 && 'Financial Details & Consent'}
            </h3>
            <p className="text-purple-300">
              {step === 1 && 'Choose your preferred credit card type and provide basic financial information'}
              {step === 2 && 'Provide your employment details and identity verification information'}
              {step === 3 && 'Enter your contact details and address information'}
              {step === 4 && 'Complete final details and provide necessary consents'}
            </p>
          </div>
          <div className="p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

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
              
              {step < 4 ? (
                <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
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