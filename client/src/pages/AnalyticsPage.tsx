import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Dashboard/Sidebar";
import Header from "@/components/Dashboard/Header";
import { useToast } from "@/hooks/use-toast";
// @ts-ignore - Chart.js types
import Chart from "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // Chart references
  const loanTrendsChartRef = useRef<HTMLCanvasElement>(null);
  const loanDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const portfolioPerformanceChartRef = useRef<HTMLCanvasElement>(null);
  const expensePredictionChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const loanTrendsChartInstance = useRef<Chart | null>(null);
  const loanDistributionChartInstance = useRef<Chart | null>(null);
  const portfolioPerformanceChartInstance = useRef<Chart | null>(null);
  const expensePredictionChartInstance = useRef<Chart | null>(null);

  // Fetch analytics data
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/analytics', timeframe],
    refetchInterval: false
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Mock data for demonstration
  const analyticsData = {
    loanTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      loanAmounts: [325000, 314000, 305000, 298000, 356000, 342000, 331000, 322000, 315000, 356000, 342000, 331000],
      repayments: [25000, 26000, 27000, 25500, 26500, 28000, 27500, 26500, 25000, 29000, 28000, 27000]
    },
    loanDistribution: {
      types: ['Education', 'Home Improvement', 'Medical', 'Business', 'Travel', 'Other'],
      values: [35, 25, 15, 10, 8, 7]
    },
    portfolioPerformance: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      actual: [528000, 535000, 542000, 550000, 558000, 565000, 572000, 580000, 588000, 595000, 602000, 610000],
      predicted: [528000, 536000, 544000, 552000, 560000, 568000, 576000, 584000, 592000, 600000, 608000, 616000]
    },
    expensePrediction: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      emis: [27500, 27500, 27500, 27500, 27500, 27500],
      otherExpenses: [35000, 37000, 36000, 38000, 39000, 37000],
      savings: [12500, 13000, 14000, 13500, 14500, 15000]
    },
    financialHealth: {
      score: 78,
      debtToIncomeRatio: 32,
      savingsRate: 18,
      investmentGrowth: 12.5,
      creditUtilization: 45
    },
    riskAssessment: {
      overall: 'Medium-Low',
      factors: [
        { name: 'Income Stability', score: 85, risk: 'Low' },
        { name: 'Debt Level', score: 65, risk: 'Medium' },
        { name: 'Investment Diversification', score: 70, risk: 'Medium' },
        { name: 'Emergency Fund', score: 50, risk: 'Medium-High' },
        { name: 'Credit History', score: 90, risk: 'Very Low' }
      ]
    }
  };

  // Financial insights based on analytics data
  const financialInsights = [
    {
      title: "Loan Repayment Optimization",
      description: "Based on your income pattern, you can optimize your EMI payments by scheduling them on the 5th of each month to align with your salary credit.",
      impact: "Positive",
      icon: "ri-money-dollar-circle-line"
    },
    {
      title: "Investment Opportunity",
      description: "You have consistently maintained a low debt-to-income ratio. Consider investing an additional ₹10,000 monthly in mutual funds for better returns.",
      impact: "Positive",
      icon: "ri-line-chart-line"
    },
    {
      title: "Debt Consolidation",
      description: "You have multiple small loans with varying interest rates. Consolidating them could save you approximately ₹15,000 in interest payments.",
      impact: "Positive",
      icon: "ri-funds-box-line"
    },
    {
      title: "Emergency Fund Alert",
      description: "Your emergency fund covers only 2 months of expenses, which is below the recommended 6-month coverage.",
      impact: "Warning",
      icon: "ri-alert-line"
    }
  ];

  useEffect(() => {
    // Initialize charts after component mounts and data is available
    if (!isLoading && !error) {
      // Loan Trends Chart
      if (loanTrendsChartRef.current) {
        const ctx = loanTrendsChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (loanTrendsChartInstance.current) {
            loanTrendsChartInstance.current.destroy();
          }

          // Create new chart
          loanTrendsChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: analyticsData.loanTrends.labels,
              datasets: [
                {
                  label: 'Loan Balance',
                  data: analyticsData.loanTrends.loanAmounts,
                  borderColor: 'rgba(59, 130, 246, 1)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  fill: true,
                  tension: 0.4
                },
                {
                  label: 'Repayments',
                  data: analyticsData.loanTrends.repayments,
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
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += '₹' + context.parsed.y.toLocaleString('en-IN');
                      }
                      return label;
                    }
                  }
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

      // Loan Distribution Chart
      if (loanDistributionChartRef.current) {
        const ctx = loanDistributionChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (loanDistributionChartInstance.current) {
            loanDistributionChartInstance.current.destroy();
          }

          // Create new chart
          loanDistributionChartInstance.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: analyticsData.loanDistribution.types,
              datasets: [
                {
                  data: analyticsData.loanDistribution.values,
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(107, 114, 128, 0.8)'
                  ],
                  borderColor: 'rgba(30, 41, 59, 1)',
                  borderWidth: 2
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right',
                  labels: {
                    color: '#e5e7eb',
                    font: {
                      family: 'Inter'
                    },
                    padding: 15
                  }
                },
                tooltip: {
                  backgroundColor: '#374151',
                  titleColor: '#f9fafb',
                  bodyColor: '#f3f4f6',
                  borderColor: '#4b5563',
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      const label = context.label || '';
                      const value = context.raw as number;
                      return `${label}: ${value}%`;
                    }
                  }
                }
              },
              cutout: '70%'
            }
          });
        }
      }

      // Portfolio Performance Chart
      if (portfolioPerformanceChartRef.current) {
        const ctx = portfolioPerformanceChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (portfolioPerformanceChartInstance.current) {
            portfolioPerformanceChartInstance.current.destroy();
          }

          // Create new chart
          portfolioPerformanceChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: analyticsData.portfolioPerformance.labels,
              datasets: [
                {
                  label: 'Actual Performance',
                  data: analyticsData.portfolioPerformance.actual,
                  borderColor: 'rgba(16, 185, 129, 1)',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Predicted Performance',
                  data: analyticsData.portfolioPerformance.predicted,
                  borderColor: 'rgba(59, 130, 246, 1)',
                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  tension: 0.4,
                  fill: true
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
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += '₹' + context.parsed.y.toLocaleString('en-IN');
                      }
                      return label;
                    }
                  }
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

      // Expense Prediction Chart
      if (expensePredictionChartRef.current) {
        const ctx = expensePredictionChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (expensePredictionChartInstance.current) {
            expensePredictionChartInstance.current.destroy();
          }

          // Create new chart
          expensePredictionChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: analyticsData.expensePrediction.labels,
              datasets: [
                {
                  label: 'EMIs',
                  data: analyticsData.expensePrediction.emis,
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Other Expenses',
                  data: analyticsData.expensePrediction.otherExpenses,
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  borderColor: 'rgba(239, 68, 68, 1)',
                  borderWidth: 1
                },
                {
                  label: 'Savings',
                  data: analyticsData.expensePrediction.savings,
                  backgroundColor: 'rgba(16, 185, 129, 0.8)',
                  borderColor: 'rgba(16, 185, 129, 1)',
                  borderWidth: 1
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
                  borderWidth: 1,
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      if (context.parsed.y !== null) {
                        label += '₹' + context.parsed.y.toLocaleString('en-IN');
                      }
                      return label;
                    }
                  }
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
                  stacked: true,
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
    }

    return () => {
      // Cleanup charts when component unmounts
      if (loanTrendsChartInstance.current) {
        loanTrendsChartInstance.current.destroy();
      }
      if (loanDistributionChartInstance.current) {
        loanDistributionChartInstance.current.destroy();
      }
      if (portfolioPerformanceChartInstance.current) {
        portfolioPerformanceChartInstance.current.destroy();
      }
      if (expensePredictionChartInstance.current) {
        expensePredictionChartInstance.current.destroy();
      }
    };
  }, [isLoading, error, timeframe]);

  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskColorClass = (risk: string) => {
    switch (risk) {
      case 'Very Low': return 'text-green-500';
      case 'Low': return 'text-emerald-500';
      case 'Medium': return 'text-blue-500';
      case 'Medium-High': return 'text-yellow-500';
      case 'High': return 'text-orange-500';
      case 'Very High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 overflow-auto ml-0 md:ml-64">
        <Header toggleSidebar={toggleSidebar} title="Financial Analytics" />
        
        <main className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="loans">Loans</TabsTrigger>
              <TabsTrigger value="investments">Investments</TabsTrigger>
              <TabsTrigger value="predictions">Predictions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="ri-heart-pulse-line mr-2 text-blue-500"></i>
                      Financial Health Score
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      An overview of your financial health metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <svg className="w-36 h-36" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeDasharray={`${analyticsData.financialHealth.score}, 100`}
                          />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                          <div className={`text-4xl font-bold ${getScoreColorClass(analyticsData.financialHealth.score)}`}>
                            {analyticsData.financialHealth.score}
                          </div>
                          <div className="text-xs text-gray-400">out of 100</div>
                        </div>
                      </div>
                      <p className="text-gray-300 mt-4">
                        Your financial health is <span className="font-semibold text-blue-400">Good</span>
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-dark-card-hover rounded-lg">
                        <p className="text-xs text-gray-400">Debt-to-Income</p>
                        <p className="text-lg font-semibold text-white">{analyticsData.financialHealth.debtToIncomeRatio}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${analyticsData.financialHealth.debtToIncomeRatio}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-dark-card-hover rounded-lg">
                        <p className="text-xs text-gray-400">Savings Rate</p>
                        <p className="text-lg font-semibold text-white">{analyticsData.financialHealth.savingsRate}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${analyticsData.financialHealth.savingsRate * 2}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-dark-card-hover rounded-lg">
                        <p className="text-xs text-gray-400">Investment Growth</p>
                        <p className="text-lg font-semibold text-green-500">+{analyticsData.financialHealth.investmentGrowth}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-purple-500 h-1.5 rounded-full" 
                            style={{ width: `${analyticsData.financialHealth.investmentGrowth * 4}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-dark-card-hover rounded-lg">
                        <p className="text-xs text-gray-400">Credit Utilization</p>
                        <p className="text-lg font-semibold text-white">{analyticsData.financialHealth.creditUtilization}%</p>
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${analyticsData.financialHealth.creditUtilization}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <i className="ri-shield-flash-line mr-2 text-yellow-500"></i>
                      Risk Assessment
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Evaluation of your financial risk factors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-6">
                      <div className="w-14 h-14 rounded-full bg-yellow-500 bg-opacity-20 flex items-center justify-center mr-4">
                        <span className={`text-lg font-bold ${getRiskColorClass(analyticsData.riskAssessment.overall)}`}>
                          {analyticsData.riskAssessment.overall.split('-')[0].charAt(0)}
                          {analyticsData.riskAssessment.overall.includes('-') && analyticsData.riskAssessment.overall.split('-')[1].charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-300">Overall Risk</p>
                        <p className={`text-xl font-semibold ${getRiskColorClass(analyticsData.riskAssessment.overall)}`}>
                          {analyticsData.riskAssessment.overall}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {analyticsData.riskAssessment.factors.map((factor, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-32 md:w-40 flex-shrink-0">
                            <p className="text-sm text-gray-400">{factor.name}</p>
                          </div>
                          <div className="flex-1 mx-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  factor.risk === 'Very Low' ? 'bg-green-500' :
                                  factor.risk === 'Low' ? 'bg-emerald-500' :
                                  factor.risk === 'Medium' ? 'bg-blue-500' :
                                  factor.risk === 'Medium-High' ? 'bg-yellow-500' :
                                  factor.risk === 'High' ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${factor.score}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-24 flex-shrink-0 text-right">
                            <span className={`text-xs font-medium ${getRiskColorClass(factor.risk)}`}>
                              {factor.risk}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-dark-card border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <i className="ri-lightbulb-flash-line mr-2 text-yellow-500"></i>
                    Financial Insights
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Personalized recommendations based on your financial data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {financialInsights.map((insight, index) => (
                      <div key={index} className="bg-dark-card-hover rounded-lg p-4">
                        <div className="flex items-start">
                          <div className={`w-10 h-10 rounded-full flex-shrink-0 ${
                            insight.impact === 'Positive' ? 'bg-green-500' : 
                            insight.impact === 'Warning' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          } bg-opacity-20 flex items-center justify-center mr-3`}>
                            <i className={`${insight.icon} ${
                              insight.impact === 'Positive' ? 'text-green-500' : 
                              insight.impact === 'Warning' ? 'text-yellow-500' : 
                              'text-red-500'
                            }`}></i>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">{insight.title}</h4>
                            <p className="text-sm text-gray-400">{insight.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Portfolio Performance</CardTitle>
                    <CardDescription className="text-gray-400">
                      Actual vs. Predicted performance of your investments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="chart-container" style={{ height: "280px" }}>
                      <canvas ref={portfolioPerformanceChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Future Expense Prediction</CardTitle>
                    <CardDescription className="text-gray-400">
                      Projected expenses for the next 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="chart-container" style={{ height: "280px" }}>
                      <canvas ref={expensePredictionChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="loans">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-dark-card border-gray-800 md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-white">Loan Trends</CardTitle>
                      <CardDescription className="text-gray-400">
                        Monthly trends of your loan balances and repayments
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className={`text-xs px-2 py-1 rounded-md ${timeframe === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setTimeframe('monthly')}
                      >
                        M
                      </button>
                      <button 
                        className={`text-xs px-2 py-1 rounded-md ${timeframe === 'quarterly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setTimeframe('quarterly')}
                      >
                        Q
                      </button>
                      <button 
                        className={`text-xs px-2 py-1 rounded-md ${timeframe === 'yearly' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                        onClick={() => setTimeframe('yearly')}
                      >
                        Y
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="chart-container" style={{ height: "320px" }}>
                      <canvas ref={loanTrendsChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Loan Distribution</CardTitle>
                    <CardDescription className="text-gray-400">
                      Distribution of your loans by purpose
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="chart-container" style={{ height: "300px" }}>
                      <canvas ref={loanDistributionChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-dark-card border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Loan Performance Metrics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Key performance indicators for your loans
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Total Outstanding</p>
                      <p className="text-xl font-semibold text-white mt-1">₹3,31,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-down-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">8.2% from last month</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Available Credit</p>
                      <p className="text-xl font-semibold text-white mt-1">₹2,75,500</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">12.5% from last month</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Average Interest Rate</p>
                      <p className="text-xl font-semibold text-white mt-1">11.8%</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-down-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">0.5% from last quarter</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">EMI to Income Ratio</p>
                      <p className="text-xl font-semibold text-white mt-1">22.4%</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-checkbox-circle-line text-blue-500 mr-1"></i>
                        <span className="text-xs text-blue-500">Healthy (below 30%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Loan Optimization Suggestions</CardTitle>
                  <CardDescription className="text-gray-400">
                    Ways to optimize your loan portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                          <i className="ri-swap-line text-blue-500"></i>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Refinance Personal Loan</h3>
                          <p className="text-sm text-gray-400 mb-3">Your personal loan at 14% can be refinanced at approximately 11.5% based on your improved credit score.</p>
                          <div className="flex flex-col md:flex-row md:items-center text-sm">
                            <div className="bg-gray-700 py-1 px-3 rounded-md mr-3 mb-2 md:mb-0">
                              <span className="text-gray-300">Current EMI: </span>
                              <span className="text-white font-medium">₹12,500</span>
                            </div>
                            <div className="bg-gray-700 py-1 px-3 rounded-md mr-3 mb-2 md:mb-0">
                              <span className="text-gray-300">Potential EMI: </span>
                              <span className="text-white font-medium">₹11,200</span>
                            </div>
                            <div className="bg-green-500 bg-opacity-20 py-1 px-3 rounded-md">
                              <span className="text-green-400">Monthly Savings: </span>
                              <span className="text-green-400 font-medium">₹1,300</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <div className="flex items-start">
                        <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                          <i className="ri-calendar-check-line text-green-500"></i>
                        </div>
                        <div>
                          <h3 className="text-white font-medium mb-1">Prepayment Opportunity</h3>
                          <p className="text-sm text-gray-400 mb-3">Making a one-time prepayment of ₹50,000 on your education loan could reduce the loan term by 8 months.</p>
                          <div className="flex flex-col md:flex-row md:items-center text-sm">
                            <div className="bg-gray-700 py-1 px-3 rounded-md mr-3 mb-2 md:mb-0">
                              <span className="text-gray-300">Current Term: </span>
                              <span className="text-white font-medium">36 months</span>
                            </div>
                            <div className="bg-gray-700 py-1 px-3 rounded-md mr-3 mb-2 md:mb-0">
                              <span className="text-gray-300">Reduced Term: </span>
                              <span className="text-white font-medium">28 months</span>
                            </div>
                            <div className="bg-green-500 bg-opacity-20 py-1 px-3 rounded-md">
                              <span className="text-green-400">Interest Savings: </span>
                              <span className="text-green-400 font-medium">₹18,500</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="investments">
              <Card className="bg-dark-card border-gray-800 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">Investment Performance</CardTitle>
                  <CardDescription className="text-gray-400">
                    Performance of your investment portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Total Investment</p>
                      <p className="text-xl font-semibold text-white mt-1">₹6,10,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">15.5% YTD</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Current Value</p>
                      <p className="text-xl font-semibold text-white mt-1">₹7,25,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">₹1,15,000 gain</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Annualized Return</p>
                      <p className="text-xl font-semibold text-green-500 mt-1">+12.7%</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-arrow-up-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">2.3% above benchmark</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Available as Collateral</p>
                      <p className="text-xl font-semibold text-white mt-1">₹5,80,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-information-line text-blue-500 mr-1"></i>
                        <span className="text-xs text-blue-500">80% of current value</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-dark-card-hover rounded-lg mb-6">
                    <h3 className="text-white font-medium mb-4">Asset Allocation</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                      <div className="col-span-1 md:col-span-2">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-300">Equity Mutual Funds</span>
                            <span className="ml-auto text-sm text-white font-medium">65%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-300">Debt Funds</span>
                            <span className="ml-auto text-sm text-white font-medium">20%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-300">Gold ETF</span>
                            <span className="ml-auto text-sm text-white font-medium">10%</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-300">Liquid Funds</span>
                            <span className="ml-auto text-sm text-white font-medium">5%</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-1 md:col-span-3 flex items-center justify-center">
                        <div className="relative h-40 w-40">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 rounded-full bg-dark-card flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-lg font-semibold text-white">₹7.25L</div>
                                <div className="text-xs text-gray-400">Total Value</div>
                              </div>
                            </div>
                          </div>
                          <svg viewBox="0 0 100 100" className="w-full h-full">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="20" strokeDasharray="234 16" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="20" strokeDasharray="50 200" strokeDashoffset="-16" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#eab308" strokeWidth="20" strokeDasharray="25 225" strokeDashoffset="-66" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="13 237" strokeDashoffset="-91" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-4">Top Performing Funds</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left pb-2 text-gray-400 font-medium">Fund Name</th>
                            <th className="text-right pb-2 text-gray-400 font-medium">Units</th>
                            <th className="text-right pb-2 text-gray-400 font-medium">Purchase Value</th>
                            <th className="text-right pb-2 text-gray-400 font-medium">Current Value</th>
                            <th className="text-right pb-2 text-gray-400 font-medium">Return</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 text-white">HDFC Small Cap Fund</td>
                            <td className="py-3 text-right text-gray-300">250.5</td>
                            <td className="py-3 text-right text-gray-300">₹1,20,000</td>
                            <td className="py-3 text-right text-white">₹1,65,000</td>
                            <td className="py-3 text-right text-green-500">+37.5%</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 text-white">Axis Bluechip Fund</td>
                            <td className="py-3 text-right text-gray-300">420.8</td>
                            <td className="py-3 text-right text-gray-300">₹1,50,000</td>
                            <td className="py-3 text-right text-white">₹1,82,000</td>
                            <td className="py-3 text-right text-green-500">+21.3%</td>
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 text-white">SBI Gold Fund</td>
                            <td className="py-3 text-right text-gray-300">180.2</td>
                            <td className="py-3 text-right text-gray-300">₹70,000</td>
                            <td className="py-3 text-right text-white">₹78,000</td>
                            <td className="py-3 text-right text-green-500">+11.4%</td>
                          </tr>
                          <tr>
                            <td className="py-3 text-white">ICICI Pru Balanced Advantage</td>
                            <td className="py-3 text-right text-gray-300">350.0</td>
                            <td className="py-3 text-right text-gray-300">₹1,25,000</td>
                            <td className="py-3 text-right text-white">₹1,36,000</td>
                            <td className="py-3 text-right text-green-500">+8.8%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="predictions">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Financial Forecast</CardTitle>
                    <CardDescription className="text-gray-400">
                      6-month projection of income, expenses, and savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="chart-container" style={{ height: "280px" }}>
                      <canvas ref={expensePredictionChartRef}></canvas>
                    </div>
                    
                    <div className="mt-4 p-4 bg-blue-600 bg-opacity-20 rounded-lg border border-blue-600 border-opacity-30">
                      <h4 className="text-blue-400 font-medium mb-2 flex items-center">
                        <i className="ri-information-line mr-2"></i>
                        Forecast Summary
                      </h4>
                      <p className="text-sm text-gray-300">
                        Based on your income and spending patterns, you're on track to save approximately ₹85,000 over the next 6 months. 
                        Your EMI commitment remains steady at ₹27,500 per month.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-card border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Loan Repayment Projections</CardTitle>
                    <CardDescription className="text-gray-400">
                      Estimated timeline for your loan repayments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-300">Education Loan</span>
                          <span className="text-sm text-white">₹1,25,000 remaining</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">65% paid</span>
                          <span className="text-xs text-gray-400">Estimated completion: Mar 2025</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-300">Personal Loan</span>
                          <span className="text-sm text-white">₹86,000 remaining</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "78%" }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">78% paid</span>
                          <span className="text-xs text-gray-400">Estimated completion: Nov 2024</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-300">Home Improvement Loan</span>
                          <span className="text-sm text-white">₹1,20,000 remaining</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-400">40% paid</span>
                          <span className="text-xs text-gray-400">Estimated completion: Sep 2025</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-dark-card-hover rounded-lg">
                      <h4 className="text-white font-medium mb-3">Debt-Free Milestone</h4>
                      <div className="flex items-center">
                        <div className="relative flex-1">
                          <div className="h-2 bg-gray-700 rounded-full"></div>
                          <div className="absolute left-0 top-0 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: "62%" }}></div>
                          <div className="absolute left-[62%] top-0 h-4 w-0.5 bg-white transform -translate-y-1"></div>
                          <div className="absolute left-[62%] top-4 transform -translate-x-1/2 bg-green-500 text-xs text-white px-1.5 py-0.5 rounded">
                            You are here
                          </div>
                          
                          <div className="mt-8 flex justify-between">
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Start</div>
                              <div className="text-sm text-white">Jan 2023</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Now</div>
                              <div className="text-sm text-white">Mar 2024</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400">Debt-Free</div>
                              <div className="text-sm text-green-400">Sep 2025</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="bg-dark-card border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Investment Growth Forecast</CardTitle>
                  <CardDescription className="text-gray-400">
                    Projected investment performance based on market trends
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="chart-container mb-6" style={{ height: "280px" }}>
                    <canvas ref={portfolioPerformanceChartRef}></canvas>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Conservative Estimate</p>
                      <p className="text-xl font-semibold text-white mt-1">₹8,15,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-line-chart-line text-blue-500 mr-1"></i>
                        <span className="text-xs text-blue-500">8% annual growth</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Moderate Estimate</p>
                      <p className="text-xl font-semibold text-white mt-1">₹8,75,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-line-chart-line text-green-500 mr-1"></i>
                        <span className="text-xs text-green-500">12% annual growth</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-dark-card-hover rounded-lg">
                      <p className="text-sm text-gray-400">Aggressive Estimate</p>
                      <p className="text-xl font-semibold text-white mt-1">₹9,35,000</p>
                      <div className="flex items-center mt-2">
                        <i className="ri-line-chart-line text-yellow-500 mr-1"></i>
                        <span className="text-xs text-yellow-500">16% annual growth</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}