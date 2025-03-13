import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function LoanCalculator() {
  const { toast } = useToast();
  const [mutualFundValue, setMutualFundValue] = useState("500000");
  const [loanDuration, setLoanDuration] = useState("24");
  const [interestRate, setInterestRate] = useState("12");
  const [calculationResult, setCalculationResult] = useState({
    eligibleAmount: 350000,
    emiAmount: 16525,
    totalInterest: 46600
  });
  const [isCalculating, setIsCalculating] = useState(false);

  const calculateEligibility = async () => {
    try {
      setIsCalculating(true);
      const response = await apiRequest('POST', '/api/loan-eligibility', {
        mutualFundValue,
        loanDuration,
        interestRate
      });
      
      const data = await response.json();
      setCalculationResult(data);
    } catch (error) {
      console.error("Error calculating loan eligibility:", error);
      toast({
        title: "Calculation Error",
        description: "Failed to calculate loan eligibility",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const applyForLoan = () => {
    toast({
      title: "Loan Application",
      description: "This feature is coming soon!",
      variant: "default"
    });
  };

  return (
    <div className="bg-dark-card rounded-xl">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Loan Eligibility Calculator</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Mutual Fund Value</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">₹</span>
              <input 
                type="text" 
                value={mutualFundValue}
                onChange={(e) => setMutualFundValue(e.target.value)}
                className="bg-gray-800 text-white rounded-lg px-3 py-2 pl-8 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Loan Duration</label>
            <select 
              className="bg-gray-800 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={loanDuration}
              onChange={(e) => setLoanDuration(e.target.value)}
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Interest Rate</label>
            <div className="flex items-center justify-between">
              <input 
                type="range" 
                min="8" 
                max="16" 
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="ml-2 text-white font-medium">{interestRate}%</span>
            </div>
          </div>
          
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center"
            onClick={calculateEligibility}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate Eligibility'}
          </button>
          
          <div className="mt-4 bg-dark-card-hover rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-300 font-medium">Max Eligible Loan</p>
              <p className="text-xl font-semibold text-white">₹{calculationResult.eligibleAmount.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-300 font-medium">Monthly EMI</p>
              <p className="text-lg font-semibold text-white">₹{calculationResult.emiAmount.toLocaleString('en-IN')}</p>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-300 font-medium">Total Interest</p>
              <p className="text-lg font-semibold text-green-400">₹{calculationResult.totalInterest.toLocaleString('en-IN')}</p>
            </div>
          </div>
          
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors flex items-center justify-center space-x-2"
            onClick={applyForLoan}
          >
            <i className="ri-bank-line"></i>
            <span>Apply for Loan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
