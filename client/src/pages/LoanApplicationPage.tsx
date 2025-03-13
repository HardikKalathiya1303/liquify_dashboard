import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Loan application schema
const loanApplicationSchema = z.object({
  mutualFundId: z.string().min(1, "Please select a mutual fund"),
  loanAmount: z.string()
    .min(1, "Loan amount is required")
    .refine(val => !isNaN(Number(val)), "Must be a valid number")
    .refine(val => Number(val) >= 10000, "Minimum loan amount is ₹10,000")
    .refine(val => Number(val) <= 10000000, "Maximum loan amount is ₹1,00,00,000"),
  loanTenure: z.string().min(1, "Loan tenure is required"),
  interestType: z.enum(["fixed", "floating"], {
    required_error: "Please select an interest type",
  }),
  purpose: z.string().min(1, "Loan purpose is required"),
  bankAccountId: z.string().min(1, "Please select a bank account"),
});

type LoanApplicationFormData = z.infer<typeof loanApplicationSchema>;

export default function LoanApplicationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [loanAmount, setLoanAmount] = useState(100000);
  const [loanTenure, setLoanTenure] = useState(12);
  const [interestRate, setInterestRate] = useState(12);
  const [emiAmount, setEmiAmount] = useState(8884);
  const [totalInterest, setTotalInterest] = useState(6608);

  // Fetch mutual funds
  const { data: mutualFunds = [] } = useQuery({
    queryKey: ['/api/mutual-funds'],
    retry: false,
  });

  // Fetch bank accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['/api/bank-accounts'],
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoanApplicationFormData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      mutualFundId: "",
      loanAmount: loanAmount.toString(),
      loanTenure: loanTenure.toString(),
      interestType: "fixed",
      purpose: "",
      bankAccountId: "",
    }
  });

  // Calculate EMI when loan details change
  const calculateEMI = (amount: number, months: number, rate: number) => {
    const r = rate / 12 / 100;
    const emi = amount * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    const totalAmount = emi * months;
    const totalInterestAmount = totalAmount - amount;

    setEmiAmount(Math.round(emi));
    setTotalInterest(Math.round(totalInterestAmount));
  };

  const handleLoanAmountChange = (value: number) => {
    setLoanAmount(value);
    setValue("loanAmount", value.toString());
    calculateEMI(value, loanTenure, interestRate);
  };

  const handleLoanTenureChange = (value: number) => {
    setLoanTenure(value);
    setValue("loanTenure", value.toString());
    calculateEMI(loanAmount, value, interestRate);
  };

  // Apply for loan mutation
  const applyLoanMutation = useMutation({
    mutationFn: async (data: LoanApplicationFormData) => {
      // Convert string values to appropriate types for API
      const formattedData = {
        mutualFundId: Number(data.mutualFundId),
        loanAmount: data.loanAmount,
        loanType: data.purpose || 'general',
        tenure: Number(data.loanTenure),
        interestRate: interestRate,
        interestType: data.interestType,
        bankAccountId: Number(data.bankAccountId)
      };
      
      const response = await apiRequest('POST', '/api/loans/apply', formattedData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit loan application');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Loan Application Submitted",
        description: `Your loan application #${data.loanNumber} has been submitted successfully. We will review it shortly.`,
        variant: "default"
      });
      
      // Create a success analytics event
      try {
        // This would track the loan application event in a real analytics system
        console.log('Loan Application Submitted', {
          loanAmount,
          loanTenure,
          interestRate,
          emiAmount
        });
      } catch (err) {
        console.error('Analytics error', err);
      }
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      // Redirect to the loans page
      setTimeout(() => {
        setLocation("/loans");
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit loan application. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: LoanApplicationFormData) => {
    // Validate if there's sufficient value in the mutual fund
    const selectedFund = mutualFunds.find((fund: any) => fund.id === Number(data.mutualFundId));
    if (selectedFund) {
      const maxLoanAmount = Number(selectedFund.currentValue) * 0.8; // 80% of fund value
      if (Number(data.loanAmount) > maxLoanAmount) {
        toast({
          title: "Validation Error",
          description: `Maximum loan amount for this fund is ₹${formatAmountWithCommas(Math.floor(maxLoanAmount))}`,
          variant: "destructive"
        });
        return;
      }
    }
    
    // All validations passed, submit the application
    applyLoanMutation.mutate(data);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatAmountWithCommas = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto ml-0 md:ml-64">
        <Header toggleSidebar={toggleSidebar} title="Apply for Loan" />
        
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold text-white mb-2">Instant Loans Against Your Mutual Funds</h3>
                  <p className="text-blue-100">Get up to 80% of your mutual fund value as a loan with minimal documentation and fast approval</p>
                </div>
                <div className="flex-shrink-0">
                  <i className="ri-funds-box-line text-6xl text-white opacity-75"></i>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card className="bg-dark-card border-gray-800 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Loan Application Form</CardTitle>
                  <CardDescription className="text-gray-400">
                    Fill in the details to apply for a loan against your mutual funds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="mutualFundId" className="text-gray-400">Select Mutual Fund</Label>
                      <select
                        id="mutualFundId"
                        className={`mt-1 w-full bg-gray-800 border-${errors.mutualFundId ? 'red-500' : 'gray-700'} text-white rounded-md px-3 py-2`}
                        {...register("mutualFundId")}
                      >
                        <option value="">Select Mutual Fund</option>
                        {mutualFunds.map((fund: any) => (
                          <option key={fund.id} value={fund.id}>
                            {fund.name} - {fund.units} units (₹{formatAmountWithCommas(Number(fund.currentValue))})
                          </option>
                        ))}
                      </select>
                      {errors.mutualFundId && (
                        <p className="text-red-500 text-xs mt-1">{errors.mutualFundId.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-gray-400">Loan Amount (₹)</Label>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">₹10,000</span>
                          <span className="text-sm text-white font-medium">₹{formatAmountWithCommas(loanAmount)}</span>
                          <span className="text-sm text-gray-400">₹10,00,000</span>
                        </div>
                        <Slider
                          value={[loanAmount]}
                          min={10000}
                          max={1000000}
                          step={10000}
                          onValueChange={(value) => handleLoanAmountChange(value[0])}
                          className="w-full"
                        />
                      </div>
                      {errors.loanAmount && (
                        <p className="text-red-500 text-xs mt-1">{errors.loanAmount.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label className="text-gray-400">Loan Tenure (Months)</Label>
                      <div className="mt-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">6 Months</span>
                          <span className="text-sm text-white font-medium">{loanTenure} Months</span>
                          <span className="text-sm text-gray-400">60 Months</span>
                        </div>
                        <Slider
                          value={[loanTenure]}
                          min={6}
                          max={60}
                          step={6}
                          onValueChange={(value) => handleLoanTenureChange(value[0])}
                          className="w-full"
                        />
                      </div>
                      {errors.loanTenure && (
                        <p className="text-red-500 text-xs mt-1">{errors.loanTenure.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="interestType" className="text-gray-400">Interest Type</Label>
                      <RadioGroup 
                        defaultValue="fixed" 
                        className="mt-1 flex space-x-6"
                        {...register("interestType")}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" className="border-gray-600" />
                          <Label htmlFor="fixed" className="text-white">Fixed Rate (12%)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="floating" id="floating" className="border-gray-600" />
                          <Label htmlFor="floating" className="text-white">Floating Rate (10.5% - 14%)</Label>
                        </div>
                      </RadioGroup>
                      {errors.interestType && (
                        <p className="text-red-500 text-xs mt-1">{errors.interestType.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="purpose" className="text-gray-400">Loan Purpose</Label>
                      <select
                        id="purpose"
                        className={`mt-1 w-full bg-gray-800 border-${errors.purpose ? 'red-500' : 'gray-700'} text-white rounded-md px-3 py-2`}
                        {...register("purpose")}
                      >
                        <option value="">Select Purpose</option>
                        <option value="Education">Education</option>
                        <option value="Home Improvement">Home Improvement</option>
                        <option value="Medical Emergency">Medical Emergency</option>
                        <option value="Business Expansion">Business Expansion</option>
                        <option value="Travel">Travel</option>
                        <option value="Wedding">Wedding</option>
                        <option value="Debt Consolidation">Debt Consolidation</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.purpose && (
                        <p className="text-red-500 text-xs mt-1">{errors.purpose.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="bankAccountId" className="text-gray-400">Disbursal Bank Account</Label>
                      <select
                        id="bankAccountId"
                        className={`mt-1 w-full bg-gray-800 border-${errors.bankAccountId ? 'red-500' : 'gray-700'} text-white rounded-md px-3 py-2`}
                        {...register("bankAccountId")}
                      >
                        <option value="">Select Bank Account</option>
                        {bankAccounts.map((account: any) => (
                          <option key={account.id} value={account.id}>
                            {account.bankName} - {account.accountNumber} {account.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                      {errors.bankAccountId && (
                        <p className="text-red-500 text-xs mt-1">{errors.bankAccountId.message}</p>
                      )}
                      {bankAccounts?.length === 0 && (
                        <p className="text-yellow-500 text-xs mt-1">Please add a bank account in your profile first</p>
                      )}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={applyLoanMutation.isPending || bankAccounts?.length === 0}
                    >
                      {applyLoanMutation.isPending ? (
                        <>
                          <i className="ri-loader-2-line animate-spin mr-2"></i>
                          Processing Application...
                        </>
                      ) : (
                        <>
                          <i className="ri-check-line mr-2"></i>
                          Submit Loan Application
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-card border-gray-800 h-fit">
                <CardHeader>
                  <CardTitle className="text-white">Loan Summary</CardTitle>
                  <CardDescription className="text-gray-400">
                    Estimated loan details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Loan Amount</span>
                        <span className="text-lg font-semibold text-white">₹{formatAmountWithCommas(loanAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Tenure</span>
                        <span className="text-white">{loanTenure} months</span>
                      </div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Interest Rate</span>
                        <span className="text-white">{interestRate}% p.a.</span>
                      </div>
                      <div className="border-t border-gray-700 my-3"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-400">Monthly EMI</span>
                        <span className="text-xl font-semibold text-blue-400">₹{formatAmountWithCommas(emiAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Interest</span>
                        <span className="text-green-400">₹{formatAmountWithCommas(totalInterest)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Important Points:</h4>
                      <ul className="text-sm text-gray-400 space-y-2">
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-2 mt-0.5"></i>
                          <span>Fast processing with minimal documentation</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-2 mt-0.5"></i>
                          <span>No prepayment charges</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-checkbox-circle-fill text-green-500 mr-2 mt-0.5"></i>
                          <span>Flexible repayment options</span>
                        </li>
                        <li className="flex items-start">
                          <i className="ri-information-line text-yellow-500 mr-2 mt-0.5"></i>
                          <span>Your mutual fund will be pledged as collateral</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}