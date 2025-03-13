import { Link } from "wouter";

interface LoanCollateral {
  fundName: string;
  units: string;
  unitPrice: string;
}

interface LoanItem {
  id: number;
  loanNumber: string;
  loanType: string;
  status: string;
  approvalDate: string;
  loanAmount: string;
  collateral: LoanCollateral;
  interestRate: string;
  interestType: string;
  emiAmount: string;
  nextEmiDate: string;
  progress: number;
  completedEmis: number;
  totalEmis: number;
}

interface LoanStatusCardProps {
  loans: LoanItem[];
}

export default function LoanStatusCard({ loans }: LoanStatusCardProps) {
  return (
    <div className="bg-dark-card rounded-xl col-span-1 lg:col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Loan Status & Collateral</h3>
          <div className="flex space-x-2">
            <button className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md transition-colors">
              All
            </button>
            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md transition-colors">
              Active
            </button>
            <button className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1 rounded-md transition-colors">
              Closed
            </button>
          </div>
        </div>
        
        {loans.map((loan) => {
          const statusColor = loan.status === 'active' ? 'green' : 
                            loan.status === 'pending' ? 'blue' : 'gray';
          
          return (
            <div 
              key={loan.id} 
              className={`bg-dark-card-hover rounded-lg p-4 mb-4 border-l-4 border-${statusColor}-500`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-medium text-white">{loan.loanType}</h4>
                    <span className={`ml-3 px-2 py-0.5 text-xs bg-${statusColor}-500 bg-opacity-20 text-${statusColor}-400 rounded-md capitalize`}>
                      {loan.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Loan #{loan.loanNumber} | Approved on {new Date(loan.approvalDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <p className="text-gray-400 text-sm">Loan Amount</p>
                  <p className="text-lg font-semibold text-white">₹{Number(loan.loanAmount).toLocaleString('en-IN')}</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Collateral</p>
                  <p className="text-sm font-medium text-white">{loan.collateral.fundName}</p>
                  <p className="text-xs text-gray-400">
                    {Number(loan.collateral.units).toLocaleString()} units @ ₹{Number(loan.collateral.unitPrice).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Interest Rate</p>
                  <p className="text-sm font-medium text-white">{loan.interestRate}% per annum</p>
                  <p className="text-xs text-gray-400">{loan.interestType} rate</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">EMI Details</p>
                  <p className="text-sm font-medium text-white">₹{Number(loan.emiAmount).toLocaleString('en-IN')} / month</p>
                  <p className="text-xs text-gray-400">
                    Next due: {new Date(loan.nextEmiDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`bg-${statusColor}-500 h-2 rounded-full`} 
                    style={{ width: `${loan.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">{loan.progress}% paid</p>
                  <p className="text-xs text-gray-400">{loan.completedEmis} of {loan.totalEmis} EMIs paid</p>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-end space-x-3">
                <Link 
                  href={`/loans/${loan.id}`}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md transition-colors flex items-center"
                >
                  <i className="ri-file-text-line mr-1"></i> View Details
                </Link>
                {loan.status === 'active' && (
                  <Link 
                    href={`/loans/${loan.id}/pay`}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors flex items-center"
                  >
                    <i className="ri-bank-card-line mr-1"></i> Pay EMI
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
