import { useEffect, useRef, useState } from "react";
// @ts-ignore - Chart.js types
import Chart from "chart.js/auto";

interface FinancialAnalyticsProps {
  data: {
    loanToValueRatio: number;
    interestBurden: number;
    monthlyTrends: {
      month: string;
      loanAmount: number;
      repayment: number;
    }[];
  };
}

export default function FinancialAnalytics({ data }: FinancialAnalyticsProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      
      if (ctx) {
        // Destroy existing chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create new chart
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.monthlyTrends.map(item => item.month),
            datasets: [
              {
                label: 'Loan Amount',
                data: data.monthlyTrends.map(item => item.loanAmount),
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4
              },
              {
                label: 'Repayment',
                data: data.monthlyTrends.map(item => item.repayment),
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#e5e7eb',
                  font: {
                    family: 'Inter'
                  }
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#374151',
                titleColor: '#f9fafb',
                bodyColor: '#f3f4f6',
                borderColor: '#4b5563',
                borderWidth: 1
              }
            },
            scales: {
              x: {
                grid: {
                  display: false,
                  color: '#4b5563'
                },
                ticks: {
                  color: '#9ca3af',
                  font: {
                    family: 'Inter'
                  }
                }
              },
              y: {
                grid: {
                  color: '#374151'
                },
                ticks: {
                  color: '#9ca3af',
                  font: {
                    family: 'Inter'
                  },
                  callback: function(value) {
                    return '₹' + value.toLocaleString('en-IN');
                  }
                }
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, timeframe]);

  return (
    <div className="bg-dark-card rounded-xl col-span-1 lg:col-span-2">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Financial Analytics</h3>
          <div className="flex">
            <button 
              className={`text-xs px-3 py-1 rounded-md ${timeframe === 'monthly' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeframe('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`text-xs px-3 py-1 rounded-md ${timeframe === 'quarterly' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeframe('quarterly')}
            >
              Quarterly
            </button>
            <button 
              className={`text-xs px-3 py-1 rounded-md ${timeframe === 'yearly' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}
              onClick={() => setTimeframe('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-dark-card-hover rounded-lg p-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">Loan to Value Ratio</h4>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-white">{data.loanToValueRatio}%</p>
                <p className="text-xs text-gray-400 mt-1">Recommended: Below 70%</p>
              </div>
              <div className="h-12 w-32 relative">
                {/* Mini chart would be rendered here in React implementation */}
                <div className="w-full h-full bg-gray-800 rounded-md opacity-50"></div>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`${data.loanToValueRatio > 70 ? 'bg-yellow-500' : 'bg-green-500'} h-2 rounded-full`} 
                style={{ width: `${data.loanToValueRatio}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-dark-card-hover rounded-lg p-4">
            <h4 className="text-gray-400 text-sm font-medium mb-3">Interest Burden</h4>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl font-semibold text-white">{data.interestBurden}%</p>
                <p className="text-xs text-gray-400 mt-1">of monthly income</p>
              </div>
              <div className="h-12 w-32 relative">
                {/* Mini chart would be rendered here in React implementation */}
                <div className="w-full h-full bg-gray-800 rounded-md opacity-50"></div>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${data.interestBurden * 2}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
