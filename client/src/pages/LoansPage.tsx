import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import LoanStatusCard from "@/components/Dashboard/LoanStatusCard";
import ApplyLoanBanner from "@/components/Dashboard/ApplyLoanBanner";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function LoansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/loans'],
    refetchInterval: false
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleApplyLoanClick = () => {
    setLocation("/loans/apply");
  };

  // Format loans for loan status card
  const formattedLoans = data?.map((loan: any) => {
    const collateral = {
      fundName: "HDFC Top 100 Mutual Fund",  // This would come from the actual mutual fund data
      units: "25000",
      unitPrice: "18.50"
    };
    
    // Calculate progress based on completed EMIs
    const completedEmis = loan.totalEmis - (loan.remainingEmis || 0);
    const progress = Math.round((completedEmis / loan.totalEmis) * 100);
    
    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      loanType: loan.loanType,
      status: loan.status,
      approvalDate: loan.approvalDate || new Date().toISOString(),
      loanAmount: loan.loanAmount,
      collateral,
      interestRate: loan.interestRate,
      interestType: "floating",
      emiAmount: loan.emiAmount,
      nextEmiDate: loan.nextEmiDate || new Date().toISOString(),
      progress,
      completedEmis,
      totalEmis: loan.totalEmis
    };
  }) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto">
        <Header toggleSidebar={toggleSidebar} title="Loan Management" />
        
        <main className="p-6">
          <ApplyLoanBanner onApplyClick={handleApplyLoanClick} />
          
          {isLoading ? (
            <div className="bg-dark-card rounded-xl p-8 animate-pulse">
              <div className="h-6 w-32 bg-gray-700 rounded mb-8"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-24 w-full bg-gray-700 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-dark-card rounded-xl p-8 text-center">
              <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">Failed to load loans</h3>
              <p className="text-gray-400">Please try again later</p>
            </div>
          ) : formattedLoans.length === 0 ? (
            <div className="bg-dark-card rounded-xl p-8 text-center">
              <i className="ri-inbox-line text-4xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">No loans found</h3>
              <p className="text-gray-400 mb-6">You haven't applied for any loans yet.</p>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleApplyLoanClick}
              >
                Apply for a Loan
              </button>
            </div>
          ) : (
            <LoanStatusCard loans={formattedLoans} />
          )}
        </main>
      </div>
    </div>
  );
}
