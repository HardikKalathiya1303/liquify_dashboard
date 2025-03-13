import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import QuickStats from "@/components/Dashboard/QuickStats";
import LoanStatusCard from "@/components/Dashboard/LoanStatusCard";
import LoanCalculator from "@/components/Dashboard/LoanCalculator";
import FinancialAnalytics from "@/components/Dashboard/FinancialAnalytics";
import RecentTransactions from "@/components/Dashboard/RecentTransactions";
import ApplyLoanBanner from "@/components/Dashboard/ApplyLoanBanner";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/dashboard'],
    refetchInterval: false
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleApplyLoanClick = () => {
    setLocation("/loans/apply");
  };

  // Format the data for financial analytics
  const financialAnalyticsData = {
    loanToValueRatio: 72,
    interestBurden: 14.2,
    monthlyTrends: [
      { month: 'Jan', loanAmount: 350000, repayment: 25000 },
      { month: 'Feb', loanAmount: 345000, repayment: 50000 },
      { month: 'Mar', loanAmount: 340000, repayment: 75000 },
      { month: 'Apr', loanAmount: 420000, repayment: 90000 },
      { month: 'May', loanAmount: 410000, repayment: 110000 },
      { month: 'Jun', loanAmount: 400000, repayment: 130000 },
    ]
  };

  // Prepare the dashboard data
  const dashboardData = data || {
    totalBorrowed: 428500,
    availableCredit: 275500,
    activeLoans: 3,
    nextEmiDue: {
      amount: "32500",
      date: "2023-08-12T00:00:00.000Z"
    },
    loans: [],
    recentTransactions: []
  };

  // Quick stats data
  const quickStats = [
    {
      title: "Total Borrowed",
      value: `₹${Number(dashboardData.totalBorrowed).toLocaleString('en-IN')}`,
      change: "12% from last month",
      changeType: "increase" as const,
      icon: "ri-money-dollar-circle-line",
      color: "blue"
    },
    {
      title: "Available Credit",
      value: `₹${Number(dashboardData.availableCredit).toLocaleString('en-IN')}`,
      change: "8% increase",
      changeType: "increase" as const,
      icon: "ri-bank-card-line",
      color: "green"
    },
    {
      title: "Active Loans",
      value: dashboardData.activeLoans.toString(),
      change: "All in good standing",
      changeType: "neutral" as const,
      icon: "ri-file-list-3-line",
      color: "purple"
    },
    {
      title: "Next EMI Due",
      value: dashboardData.nextEmiDue ? `₹${Number(dashboardData.nextEmiDue.amount).toLocaleString('en-IN')}` : "No EMI due",
      change: dashboardData.nextEmiDue ? `Due in ${Math.ceil((new Date(dashboardData.nextEmiDue.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` : "",
      changeType: "neutral" as const,
      icon: "ri-calendar-check-line",
      color: "yellow"
    }
  ];

  // Format loans for loan status card
  const formattedLoans = dashboardData.loans?.map(loan => {
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

  // Format transactions for recent transactions component
  const formattedTransactions = dashboardData.recentTransactions?.map(transaction => {
    // Find the associated loan to get loan number
    const loan = dashboardData.loans?.find(l => l.id === transaction.loanId);
    return {
      id: transaction.id,
      transactionType: transaction.transactionType,
      amount: transaction.amount,
      transactionDate: transaction.transactionDate,
      description: transaction.description || "",
      loanNumber: loan?.loanNumber || "N/A"
    };
  }) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="p-6">
          {isLoading ? (
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-dark-card rounded-xl p-6 animate-pulse">
                    <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
                    <div className="h-8 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-36 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <QuickStats stats={quickStats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <LoanStatusCard loans={formattedLoans} />
                <LoanCalculator />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <FinancialAnalytics data={financialAnalyticsData} />
                <RecentTransactions transactions={formattedTransactions} />
              </div>
              
              <ApplyLoanBanner onApplyClick={handleApplyLoanClick} />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
