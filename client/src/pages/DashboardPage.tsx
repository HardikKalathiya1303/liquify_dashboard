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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  // Marketing sections for dashboard
  const marketingCards = [
    {
      title: "Investment Advisory",
      description: "Get personalized investment advice from our experts",
      icon: "ri-funds-box-line",
      color: "bg-blue-600",
      cta: "Learn More"
    },
    {
      title: "Tax Planning",
      description: "Optimize your investments for maximum tax benefits",
      icon: "ri-money-rupee-circle-line",
      color: "bg-green-600",
      cta: "Get Started"
    },
    {
      title: "Wealth Management",
      description: "Comprehensive solutions for high net worth individuals",
      icon: "ri-line-chart-line",
      color: "bg-purple-600",
      cta: "Contact Us"
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto ml-0 md:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="p-6">
          {isLoading ? (
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                    <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
                    <div className="h-8 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 w-36 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <ApplyLoanBanner onApplyClick={handleApplyLoanClick} />
              </div>
              
              <div className="mb-6">
                <QuickStats stats={quickStats} />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <i className="ri-funds-line mr-2 text-blue-500"></i>
                        Active Loans
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Overview of your current loans and their status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formattedLoans.length > 0 ? (
                        <LoanStatusCard loans={formattedLoans} />
                      ) : (
                        <div className="text-center py-10">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                            <i className="ri-bank-line text-3xl text-gray-500"></i>
                          </div>
                          <h3 className="text-lg font-medium text-white mb-2">No active loans</h3>
                          <p className="text-gray-400 mb-6 max-w-md mx-auto">You don't have any active loans. Apply for a loan against your mutual funds with just a few clicks.</p>
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleApplyLoanClick}
                          >
                            Apply for Loan
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <LoanCalculator />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <i className="ri-line-chart-line mr-2 text-blue-500"></i>
                        Financial Analytics
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Visualized analysis of your financial data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FinancialAnalytics data={financialAnalyticsData} />
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-gray-800 border-gray-700 h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <i className="ri-exchange-dollar-line mr-2 text-blue-500"></i>
                        Recent Transactions
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Your latest financial activities
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {formattedTransactions.length > 0 ? (
                        <RecentTransactions transactions={formattedTransactions} />
                      ) : (
                        <div className="text-center py-10">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                            <i className="ri-exchange-funds-line text-3xl text-gray-500"></i>
                          </div>
                          <h3 className="text-lg font-medium text-white mb-2">No transactions</h3>
                          <p className="text-gray-400 mb-2">You don't have any transactions yet.</p>
                          <Button 
                            variant="outline"
                            className="text-blue-500 border-blue-500 hover:bg-blue-950"
                            onClick={() => setLocation("/transactions")}
                          >
                            View All Transactions
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {marketingCards.map((card, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden">
                    <div className="p-6">
                      <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center mb-4`}>
                        <i className={`${card.icon} text-white text-2xl`}></i>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                      <p className="text-gray-400 mb-4">{card.description}</p>
                      <Button variant="outline" className="text-white border-gray-600 hover:border-white hover:bg-gray-700">
                        {card.cta}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              
              <Card className="bg-gradient-to-r from-blue-900 to-blue-800 border-0 mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-xl font-semibold text-white">Future-Proof Your Finances with AI</h3>
                      <p className="text-blue-200 max-w-lg">Our AI-powered financial forecasting tools can help you predict market trends and optimize your investment strategy.</p>
                    </div>
                    <Button className="bg-white text-blue-900 hover:bg-blue-50">
                      Try AI Predictions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
