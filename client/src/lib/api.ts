import { apiRequest as queryApiRequest } from "@/lib/queryClient";

/**
 * Helper function to make API requests
 * Wraps the queryClient apiRequest function
 */
export const apiRequest = async (
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> => {
  return queryApiRequest(method, url, data);
};

/**
 * Format currency value to Indian Rupee format
 */
export const formatIndianCurrency = (value: string | number): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `₹${numValue.toLocaleString('en-IN')}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Calculate days remaining until a date
 */
export const calculateDaysRemaining = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate loan progress based on completed and total EMIs
 */
export const calculateLoanProgress = (completedEmis: number, totalEmis: number): number => {
  return Math.round((completedEmis / totalEmis) * 100);
};

/**
 * Get transaction type display name
 */
export const getTransactionTypeName = (type: string): string => {
  switch (type) {
    case 'emi_payment':
      return 'EMI Payment';
    case 'loan_disbursement':
      return 'Loan Disbursement';
    case 'fee':
      return 'Processing Fee';
    default:
      return type;
  }
};

/**
 * Get color for transaction type
 */
export const getTransactionColor = (type: string): string => {
  switch (type) {
    case 'emi_payment':
      return 'green';
    case 'loan_disbursement':
      return 'blue';
    case 'fee':
      return 'yellow';
    default:
      return 'gray';
  }
};

/**
 * Get icon for transaction type
 */
export const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'emi_payment':
      return 'ri-arrow-down-line';
    case 'loan_disbursement':
      return 'ri-bank-line';
    case 'fee':
      return 'ri-refund-2-line';
    default:
      return 'ri-exchange-line';
  }
};
