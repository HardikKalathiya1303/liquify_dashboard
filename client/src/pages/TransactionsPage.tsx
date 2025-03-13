import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  transactionType: string;
  amount: string;
  transactionDate: string;
  description: string;
  loanId: number;
  loanNumber?: string;
}

export default function TransactionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
    refetchInterval: false
  });

  // Get loan numbers for each transaction
  const { data: loans } = useQuery({
    queryKey: ['/api/loans'],
    refetchInterval: false
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Prepare and format transactions with loan numbers
  const transactions: Transaction[] = data?.map((transaction: any) => {
    const loan = loans?.find((l: any) => l.id === transaction.loanId);
    return {
      ...transaction,
      loanNumber: loan?.loanNumber || "Unknown"
    };
  }) || [];

  // Filter transactions by type
  const filteredTransactions = filter === "all" 
    ? transactions 
    : transactions.filter(t => t.transactionType === filter);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'emi_payment':
        return "ri-arrow-down-line";
      case 'loan_disbursement':
        return "ri-bank-line";
      case 'fee':
        return "ri-refund-2-line";
      default:
        return "ri-exchange-line";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'emi_payment':
        return "green";
      case 'loan_disbursement':
        return "blue";
      case 'fee':
        return "yellow";
      default:
        return "gray";
    }
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto">
        <Header toggleSidebar={toggleSidebar} title="Transaction History" />
        
        <main className="p-6">
          <div className="bg-dark-card rounded-xl">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 md:mb-0">All Transactions</h3>
                
                <div className="flex space-x-2">
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    onClick={() => setFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md ${filter === 'emi_payment' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    onClick={() => setFilter('emi_payment')}
                  >
                    EMI Payments
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md ${filter === 'loan_disbursement' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    onClick={() => setFilter('loan_disbursement')}
                  >
                    Disbursements
                  </button>
                  <button 
                    className={`px-3 py-1.5 text-sm rounded-md ${filter === 'fee' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                    onClick={() => setFilter('fee')}
                  >
                    Fees
                  </button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-dark-card-hover rounded-lg p-4 animate-pulse">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div className="ml-3 flex-1">
                          <div className="h-4 w-1/4 bg-gray-700 rounded"></div>
                          <div className="h-3 w-2/5 bg-gray-700 rounded mt-2"></div>
                        </div>
                        <div className="h-4 w-1/6 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">Failed to load transactions</h3>
                  <p className="text-gray-400">Please try again later</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-inbox-line text-4xl text-gray-500 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">No transactions found</h3>
                  <p className="text-gray-400">Try changing the filter or check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => {
                    const iconColor = getTransactionColor(transaction.transactionType);
                    const icon = getTransactionIcon(transaction.transactionType);
                    const formattedAmount = transaction.transactionType === 'fee' 
                      ? `-₹${Number(transaction.amount).toLocaleString('en-IN')}` 
                      : `+₹${Number(transaction.amount).toLocaleString('en-IN')}`;
                    const amountColor = transaction.transactionType === 'fee' ? 'yellow' : 'green';
                    
                    return (
                      <div key={transaction.id} className="bg-dark-card-hover rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center">
                          <div className="flex items-center mb-3 md:mb-0">
                            <div className={`w-10 h-10 rounded-full bg-${iconColor}-500 bg-opacity-20 flex items-center justify-center text-${iconColor}-500`}>
                              <i className={icon}></i>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-white">
                                {transaction.transactionType === 'emi_payment' ? 'EMI Payment' : 
                                 transaction.transactionType === 'loan_disbursement' ? 'Loan Disbursement' : 
                                 transaction.transactionType === 'fee' ? 'Processing Fee' : 
                                 transaction.description}
                              </p>
                              <p className="text-xs text-gray-400">
                                Loan #{transaction.loanNumber}
                              </p>
                            </div>
                          </div>
                          
                          <div className="md:ml-auto md:text-right">
                            <p className={`text-sm font-semibold text-${amountColor}-400`}>{formattedAmount}</p>
                            <p className="text-xs text-gray-400">{formatTransactionDate(transaction.transactionDate)}</p>
                          </div>
                        </div>
                        
                        {transaction.description && (
                          <div className="mt-3 pl-13 md:ml-13">
                            <p className="text-xs text-gray-400">
                              {transaction.description}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
