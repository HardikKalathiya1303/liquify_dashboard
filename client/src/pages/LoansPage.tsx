import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import LoanStatusCard from "@/components/Dashboard/LoanStatusCard";
import ApplyLoanBanner from "@/components/Dashboard/ApplyLoanBanner";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LoansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTab, setSelectedTab] = useState("active");
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);

  // Fetch loans
  const { data: loansData, isLoading: loansLoading, error: loansError } = useQuery({
    queryKey: ['/api/loans'],
    refetchInterval: 10000 // Refresh every 10 seconds to see status changes
  });

  // Fetch mutual funds for collateral info
  const { data: mutualFundsData = [] } = useQuery({
    queryKey: ['/api/mutual-funds'],
    refetchInterval: false
  });

  // Pay EMI mutation
  const payEmiMutation = useMutation({
    mutationFn: async (loanId: number) => {
      const response = await apiRequest('POST', `/api/loans/${loanId}/pay-emi`, {});
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to pay EMI');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "EMI Payment Successful",
        description: "Your EMI payment has been processed successfully.",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process EMI payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleApplyLoanClick = () => {
    setLocation("/loans/apply");
  };

  const handlePayEmi = (loanId: number) => {
    if (confirm("Are you sure you want to make an EMI payment for this loan?")) {
      payEmiMutation.mutate(loanId);
    }
  };

  const handleViewLoanDetails = (loanId: number) => {
    setSelectedLoanId(loanId);
  };

  const handleViewTransactions = (loanId: number) => {
    setLocation(`/transactions?loanId=${loanId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-gray-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending Approval';
      case 'closed':
        return 'Closed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  // Format loans for display
  const formatLoans = (loans: any[] = []) => {
    return loans.map((loan: any) => {
      // Find the matching mutual fund for this loan (collateral)
      const mutualFund = mutualFundsData.find((fund: any) => fund.id === loan.collateralId) || {
        fundName: "Mutual Fund",
        units: "0",
        unitPrice: "0"
      };

      const collateral = {
        fundName: mutualFund.fundName || mutualFund.name || "Mutual Fund",
        units: mutualFund.units || "0",
        unitPrice: mutualFund.unitPrice || "0"
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
        totalEmis: loan.totalEmis,
        remainingEmis: loan.remainingEmis
      };
    });
  };

  const formattedLoans = formatLoans(loansData);
  
  // Filter loans by status
  const activeLoans = formattedLoans.filter(loan => loan.status === 'active');
  const pendingLoans = formattedLoans.filter(loan => loan.status === 'pending');
  const closedLoans = formattedLoans.filter(loan => loan.status === 'closed' || loan.status === 'rejected');

  // Get the selected loan
  const selectedLoan = selectedLoanId 
    ? formattedLoans.find(loan => loan.id === selectedLoanId) 
    : null;

  const formatCurrency = (amount: string | number) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto ml-0 md:ml-64">
        <Header toggleSidebar={toggleSidebar} title="Loan Management" />
        
        <main className="p-6">
          <div className="mb-6">
            <ApplyLoanBanner onApplyClick={handleApplyLoanClick} />
          </div>
          
          {loansLoading ? (
            <div className="bg-gray-800 rounded-xl p-8 animate-pulse">
              <div className="h-6 w-32 bg-gray-700 rounded mb-8"></div>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-24 w-full bg-gray-700 rounded mb-4"></div>
                </div>
              ))}
            </div>
          ) : loansError ? (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">Failed to load loans</h3>
              <p className="text-gray-400">Please try again later</p>
            </div>
          ) : formattedLoans.length === 0 ? (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <i className="ri-bank-card-line text-4xl text-gray-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No loans found</h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">You haven't applied for any loans yet. Get instant loans against your mutual funds with just a few clicks.</p>
              <Button 
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleApplyLoanClick}
              >
                <i className="ri-add-line mr-2"></i>
                Apply for a Loan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className={`lg:col-span-${selectedLoan ? 2 : 3}`}>
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="border-b border-gray-700 pb-3">
                    <CardTitle className="text-white">Your Loans</CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your active and pending loans
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <Tabs defaultValue="active" onValueChange={setSelectedTab}>
                      <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="active" className={selectedTab === "active" ? "text-white" : "text-gray-400"}>
                          Active
                          {activeLoans.length > 0 && (
                            <Badge className="ml-2 bg-green-600">{activeLoans.length}</Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="pending" className={selectedTab === "pending" ? "text-white" : "text-gray-400"}>
                          Pending
                          {pendingLoans.length > 0 && (
                            <Badge className="ml-2 bg-yellow-600">{pendingLoans.length}</Badge>
                          )}
                        </TabsTrigger>
                        <TabsTrigger value="closed" className={selectedTab === "closed" ? "text-white" : "text-gray-400"}>
                          Closed
                          {closedLoans.length > 0 && (
                            <Badge className="ml-2 bg-gray-600">{closedLoans.length}</Badge>
                          )}
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="active">
                        {activeLoans.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-400">No active loans</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeLoans.map(loan => (
                              <Card key={loan.id} className="bg-gray-750 border-gray-700">
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                      <div className="flex items-center mb-2">
                                        <h3 className="text-white font-medium">{loan.loanNumber}</h3>
                                        <div className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${getStatusColor(loan.status)}`}>
                                          {getStatusText(loan.status)}
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-400 mb-1">
                                        <span className="font-medium text-white">{formatCurrency(loan.loanAmount)}</span> • {loan.completedEmis}/{loan.totalEmis} EMIs paid
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Applied for: {loan.loanType} • Next EMI: {formatDate(loan.nextEmiDate)}
                                      </p>
                                    </div>
                                    <div className="flex mt-4 md:mt-0 space-x-2">
                                      <Button 
                                        size="sm" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleViewLoanDetails(loan.id)}
                                      >
                                        Details
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handlePayEmi(loan.id)}
                                        disabled={payEmiMutation.isPending}
                                      >
                                        {payEmiMutation.isPending && payEmiMutation.variables === loan.id ? (
                                          <i className="ri-loader-2-line animate-spin mr-1"></i>
                                        ) : (
                                          <i className="ri-bank-card-line mr-1"></i>
                                        )}
                                        Pay EMI
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-4">
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ width: `${loan.progress}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <span>{loan.progress}% complete</span>
                                      <span>EMI: {formatCurrency(loan.emiAmount)}/month</span>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="pending">
                        {pendingLoans.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-400">No pending loan applications</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {pendingLoans.map(loan => (
                              <Card key={loan.id} className="bg-gray-750 border-gray-700">
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                      <div className="flex items-center mb-2">
                                        <h3 className="text-white font-medium">{loan.loanNumber}</h3>
                                        <div className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${getStatusColor(loan.status)}`}>
                                          {getStatusText(loan.status)}
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-400 mb-1">
                                        Amount: <span className="font-medium text-white">{formatCurrency(loan.loanAmount)}</span>
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Applied for: {loan.loanType} • Applied on: {formatDate(loan.approvalDate)}
                                      </p>
                                    </div>
                                    <div className="flex mt-4 md:mt-0 space-x-2">
                                      <Button 
                                        size="sm" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleViewLoanDetails(loan.id)}
                                      >
                                        Details
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="closed">
                        {closedLoans.length === 0 ? (
                          <div className="text-center py-6">
                            <p className="text-gray-400">No closed loans</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {closedLoans.map(loan => (
                              <Card key={loan.id} className="bg-gray-750 border-gray-700">
                                <CardContent className="p-4">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                                    <div>
                                      <div className="flex items-center mb-2">
                                        <h3 className="text-white font-medium">{loan.loanNumber}</h3>
                                        <div className={`ml-2 px-2 py-0.5 rounded text-xs text-white ${getStatusColor(loan.status)}`}>
                                          {getStatusText(loan.status)}
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-400 mb-1">
                                        Amount: <span className="font-medium text-white">{formatCurrency(loan.loanAmount)}</span>
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Applied for: {loan.loanType} • Completed on: {formatDate(loan.approvalDate)}
                                      </p>
                                    </div>
                                    <div className="flex mt-4 md:mt-0 space-x-2">
                                      <Button 
                                        size="sm" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => handleViewTransactions(loan.id)}
                                      >
                                        View Transactions
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                  <CardFooter className="border-t border-gray-700 pt-4">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleApplyLoanClick}
                    >
                      <i className="ri-add-line mr-2"></i> Apply for New Loan
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              {selectedLoan && (
                <div>
                  <Card className="bg-gray-800 border-gray-700 sticky top-20">
                    <CardHeader className="border-b border-gray-700 pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white">Loan Details</CardTitle>
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0" 
                          onClick={() => setSelectedLoanId(null)}
                        >
                          <i className="ri-close-line text-gray-400"></i>
                        </Button>
                      </div>
                      <CardDescription className="text-gray-400">
                        {selectedLoan.loanNumber}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full ${getStatusColor(selectedLoan.status)} flex items-center justify-center mr-3`}>
                            <i className="ri-funds-line text-white text-lg"></i>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium text-white">{formatCurrency(selectedLoan.loanAmount)}</h3>
                            <p className="text-xs text-gray-400">{selectedLoan.loanType} Loan</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <p className="text-sm text-white">{getStatusText(selectedLoan.status)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Interest Rate</p>
                            <p className="text-sm text-white">{selectedLoan.interestRate}% {selectedLoan.interestType}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tenure</p>
                            <p className="text-sm text-white">{selectedLoan.totalEmis} months</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Monthly EMI</p>
                            <p className="text-sm text-white">{formatCurrency(selectedLoan.emiAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Start Date</p>
                            <p className="text-sm text-white">{formatDate(selectedLoan.approvalDate)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Next EMI Due</p>
                            <p className="text-sm text-white">{formatDate(selectedLoan.nextEmiDate)}</p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-xs text-gray-500 mb-2">Collateral</p>
                          <div className="bg-gray-750 rounded-lg p-3">
                            <p className="text-sm text-white mb-1">{selectedLoan.collateral.fundName}</p>
                            <div className="flex justify-between">
                              <p className="text-xs text-gray-400">{selectedLoan.collateral.units} units</p>
                              <p className="text-xs text-gray-400">₹{selectedLoan.collateral.unitPrice}/unit</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <p className="text-xs text-gray-500 mb-2">Repayment Progress</p>
                          <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-green-500 h-2.5 rounded-full" 
                              style={{ width: `${selectedLoan.progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{selectedLoan.completedEmis} paid</span>
                            <span>{selectedLoan.remainingEmis} remaining</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    {selectedLoan.status === 'active' && (
                      <CardFooter className="border-t border-gray-700 pt-4 flex flex-col space-y-2">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handlePayEmi(selectedLoan.id)}
                          disabled={payEmiMutation.isPending}
                        >
                          {payEmiMutation.isPending && payEmiMutation.variables === selectedLoan.id ? (
                            <i className="ri-loader-2-line animate-spin mr-2"></i>
                          ) : (
                            <i className="ri-bank-card-line mr-2"></i>
                          )}
                          Pay EMI Now
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full border-blue-600 text-blue-500 hover:bg-blue-900/20"
                          onClick={() => handleViewTransactions(selectedLoan.id)}
                        >
                          <i className="ri-exchange-funds-line mr-2"></i>
                          View Transactions
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
