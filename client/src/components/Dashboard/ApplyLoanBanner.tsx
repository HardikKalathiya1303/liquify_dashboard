interface ApplyLoanBannerProps {
  onApplyClick: () => void;
}

export default function ApplyLoanBanner({ onApplyClick }: ApplyLoanBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h3 className="text-xl font-semibold text-white mb-2">Need additional funds?</h3>
          <p className="text-blue-100">Apply for a new loan against your mutual funds with just a few clicks.</p>
        </div>
        <button 
          className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
          onClick={onApplyClick}
        >
          Apply Now
        </button>
      </div>
    </div>
  );
}
