import { Link } from "wouter";

interface Transaction {
  id: number;
  transactionType: string;
  amount: string;
  transactionDate: string;
  description: string;
  loanNumber: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function RecentTransactions({ transactions, isLoading = false }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Recent Transactions</h3>
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse"></div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="h-3 w-32 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-3 w-20 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const formatTransactionAmount = (type: string, amount: string) => {
    const symbol = type === 'fee' ? '-' : '+';
    return `${symbol}₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formattedDate} • ${formattedTime}`;
  };

  return (
    <div className="bg-dark-card rounded-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Link href="/transactions" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
        </div>
        
        <div className="space-y-5">
          {transactions.map((transaction) => {
            const iconColor = getTransactionColor(transaction.transactionType);
            const icon = getTransactionIcon(transaction.transactionType);
            const formattedAmount = formatTransactionAmount(transaction.transactionType, transaction.amount);
            const amountColor = transaction.transactionType === 'fee' ? 'yellow' : 'green';
            
            return (
              <div key={transaction.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full bg-${iconColor}-500 bg-opacity-20 flex items-center justify-center text-${iconColor}-500`}>
                  <i className={icon}></i>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-white">
                      {transaction.transactionType === 'emi_payment' ? 'EMI Payment' : 
                       transaction.transactionType === 'loan_disbursement' ? 'Loan Disbursement' : 
                       transaction.transactionType === 'fee' ? 'Processing Fee' : 
                       transaction.description}
                    </p>
                    <p className={`text-sm font-semibold text-${amountColor}-400`}>{formattedAmount}</p>
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-400">{formatTransactionDate(transaction.transactionDate)}</p>
                    <p className="text-xs text-gray-300">Loan #{transaction.loanNumber}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <Link href="/transactions">
          <button className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors">
            Load More
          </button>
        </Link>
      </div>
    </div>
  );
}
