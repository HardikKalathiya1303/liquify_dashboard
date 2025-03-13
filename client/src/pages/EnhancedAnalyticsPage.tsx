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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function EnhancedAnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [activeTab, setActiveTab] = useState("overview");
  
  // Chart references
  const loanTrendsChartRef = useRef<HTMLCanvasElement>(null);
  const loanDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const portfolioPerformanceChartRef = useRef<HTMLCanvasElement>(null);
  const expensePredictionChartRef = useRef<HTMLCanvasElement>(null);
  const investmentGrowthChartRef = useRef<HTMLCanvasElement>(null);
  const creditScoreChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const loanTrendsChartInstance = useRef<Chart | null>(null);
  const loanDistributionChartInstance = useRef<Chart | null>(null);
  const portfolioPerformanceChartInstance = useRef<Chart | null>(null);
  const expensePredictionChartInstance = useRef<Chart | null>(null);
  const investmentGrowthChartInstance = useRef<Chart | null>(null);
  const creditScoreChartInstance = useRef<Chart | null>(null);

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
    investmentGrowth: {
      labels: ['2022 Q1', '2022 Q2', '2022 Q3', '2022 Q4', '2023 Q1', '2023 Q2', '2023 Q3', '2023 Q4', '2024 Q1'],
      growth: [510000, 525000, 545000, 570000, 600000, 635000, 675000, 720000, 775000],
      contributions: [490000, 500000, 510000, 520000, 530000, 540000, 550000, 560000, 570000]
    },
    creditScore: {
      current: 780,
      history: [720, 730, 735, 745, 755, 760, 765, 770, 780],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
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
    },
    mutualFunds: {
      totalValue: "₹7,85,000",
      totalReturn: "12.4%",
      funds: [
        { name: "HDFC Top 100 Fund", value: "₹2,50,000", return: "14.2%", type: "Equity" },
        { name: "SBI Bluechip Fund", value: "₹1,75,000", return: "11.8%", type: "Equity" },
        { name: "Axis Midcap Fund", value: "₹1,25,000", return: "15.3%", type: "Equity" },
        { name: "ICICI Pru Balanced Advantage", value: "₹1,35,000", return: "9.7%", type: "Hybrid" },
        { name: "Kotak Corporate Bond Fund", value: "₹1,00,000", return: "7.2%", type: "Debt" }
      ]
    },
    investmentAllocation: {
      equity: 65,
      debt: 25,
      cash: 10
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

  // Function to get appropriate color for risk level
  const getRiskColorClass = (risk: string) => {
    switch(risk) {
      case 'Very Low': return 'text-green-500';
      case 'Low': return 'text-emerald-500';
      case 'Medium': return 'text-blue-500';
      case 'Medium-Low': return 'text-blue-400';
      case 'Medium-High': return 'text-yellow-500';
      case 'High': return 'text-orange-500';
      case 'Very High': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

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

      // Investment Growth Chart
      if (investmentGrowthChartRef.current) {
        const ctx = investmentGrowthChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (investmentGrowthChartInstance.current) {
            investmentGrowthChartInstance.current.destroy();
          }

          // Create new chart
          investmentGrowthChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: analyticsData.investmentGrowth.labels,
              datasets: [
                {
                  label: 'Portfolio Value',
                  data: analyticsData.investmentGrowth.growth,
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderWidth: 2,
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Contributions',
                  data: analyticsData.investmentGrowth.contributions,
                  borderColor: 'rgba(245, 158, 11, 1)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
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

      // Credit Score Chart
      if (creditScoreChartRef.current) {
        const ctx = creditScoreChartRef.current.getContext('2d');
        
        if (ctx) {
          // Destroy existing chart if it exists
          if (creditScoreChartInstance.current) {
            creditScoreChartInstance.current.destroy();
          }

          // Create new chart
          creditScoreChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: analyticsData.creditScore.labels,
              datasets: [
                {
                  label: 'Credit Score',
                  data: analyticsData.creditScore.history,
                  borderColor: 'rgba(139, 92, 246, 1)',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderWidth: 3,
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                  pointRadius: 4,
                  pointHoverRadius: 6
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
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
                  min: 650,
                  max: 850,
                  grid: {
                    color: '#374151'
                  },
                  ticks: {
                    color: '#9ca3af',
                    font: {
                      family: 'Inter'
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
      if (investmentGrowthChartInstance.current) {
        investmentGrowthChartInstance.current.destroy();
      }
      if (creditScoreChartInstance.current) {
        creditScoreChartInstance.current.destroy();
      }
    };
  }, [timeframe, isLoading, error]);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} title="Financial Analytics" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Timeframe selector */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                Financial Analytics Dashboard
              </h1>
              <div className="flex space-x-2">
                <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
                  <SelectTrigger className="w-[140px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <i className="ri-download-line mr-2"></i>
                  Export
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800 border-gray-700 p-1">
                <TabsTrigger value="overview" className={`data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === 'overview' ? 'bg-blue-600 text-white' : ''}`}>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="investments" className={`data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === 'investments' ? 'bg-blue-600 text-white' : ''}`}>
                  Investments
                </TabsTrigger>
                <TabsTrigger value="loans" className={`data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === 'loans' ? 'bg-blue-600 text-white' : ''}`}>
                  Loans
                </TabsTrigger>
                <TabsTrigger value="predictions" className={`data-[state=active]:bg-blue-600 data-[state=active]:text-white ${activeTab === 'predictions' ? 'bg-blue-600 text-white' : ''}`}>
                  Predictions
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Financial Health Score */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="bg-gray-800 border-gray-700 col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Financial Health Score</CardTitle>
                      <CardDescription className="text-gray-400">Your overall financial wellness</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-40">
                        <div className="relative w-36 h-36">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke="#1f2937" 
                              strokeWidth="10"
                            />
                            <circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              stroke="#3b82f6" 
                              strokeWidth="10" 
                              strokeDasharray="282.6" 
                              strokeDashoffset={282.6 - (282.6 * analyticsData.financialHealth.score / 100)}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold">{analyticsData.financialHealth.score}</span>
                            <span className="text-sm text-gray-400">out of 100</span>
                          </div>
                        </div>
                        <div className="mt-4 w-full">
                          <div className="text-center">
                            <span className="text-sm text-gray-400">Status: </span>
                            <Badge className="bg-blue-600 hover:bg-blue-700">Good</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Credit Score */}
                  <Card className="bg-gray-800 border-gray-700 col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Credit Score</CardTitle>
                      <CardDescription className="text-gray-400">Your current credit rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-full flex items-center justify-center mb-2">
                          <span className="text-4xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-transparent bg-clip-text">
                            {analyticsData.creditScore.current}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 h-4 rounded-full mb-3">
                          <div 
                            className="h-4 rounded-full bg-gradient-to-r from-purple-600 to-violet-500" 
                            style={{ width: `${(analyticsData.creditScore.current - 300) / 550 * 100}%` }}
                          ></div>
                        </div>
                        <div className="w-full flex justify-between text-xs text-gray-400 mb-4">
                          <span>300</span>
                          <span>Poor</span>
                          <span>Fair</span>
                          <span>Good</span>
                          <span>Excellent</span>
                          <span>850</span>
                        </div>
                        <div className="w-full h-20">
                          <canvas ref={creditScoreChartRef}></canvas>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risk Assessment */}
                  <Card className="bg-gray-800 border-gray-700 col-span-1">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Risk Assessment</CardTitle>
                      <CardDescription className="text-gray-400">Your financial risk profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col">
                        <div className="mb-4 text-center">
                          <span className="text-sm">Overall Risk: </span>
                          <span className={`text-lg font-bold ${getRiskColorClass(analyticsData.riskAssessment.overall)}`}>
                            {analyticsData.riskAssessment.overall}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {analyticsData.riskAssessment.factors.map((factor, index) => (
                            <div key={index} className="flex flex-col">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm">{factor.name}</span>
                                <span className={`text-xs font-medium ${getRiskColorClass(factor.risk)}`}>
                                  {factor.risk}
                                </span>
                              </div>
                              <div className="w-full bg-gray-700 h-2 rounded-full">
                                <div 
                                  className={`h-2 rounded-full ${
                                    factor.score > 80 ? 'bg-green-500' : 
                                    factor.score > 60 ? 'bg-blue-500' : 
                                    factor.score > 40 ? 'bg-yellow-500' : 
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${factor.score}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial Insights */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Financial Insights</CardTitle>
                    <CardDescription className="text-gray-400">Personalized recommendations based on your financial data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {financialInsights.map((insight, index) => (
                        <Card key={index} className={`bg-gray-700 border-none overflow-hidden`}>
                          <div className={`absolute top-0 left-0 w-1 h-full ${
                            insight.impact === 'Positive' ? 'bg-green-500' : 
                            insight.impact === 'Warning' ? 'bg-yellow-500' : 
                            'bg-blue-500'
                          }`}></div>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                insight.impact === 'Positive' ? 'bg-green-500/20 text-green-500' : 
                                insight.impact === 'Warning' ? 'bg-yellow-500/20 text-yellow-500' : 
                                'bg-blue-500/20 text-blue-500'
                              }`}>
                                <i className={`${insight.icon} text-lg`}></i>
                              </div>
                              <div>
                                <h4 className="font-medium mb-1">{insight.title}</h4>
                                <p className="text-sm text-gray-400">{insight.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Expense Prediction */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Expense Forecast</CardTitle>
                    <CardDescription className="text-gray-400">Projected expenses for the next 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <canvas ref={expensePredictionChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Investments Tab */}
              <TabsContent value="investments" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Investment Portfolio Summary */}
                  <Card className="bg-gray-800 border-gray-700 col-span-1">
                    <CardHeader>
                      <CardTitle>Portfolio Summary</CardTitle>
                      <CardDescription className="text-gray-400">Your investment overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Total Value</div>
                          <div className="text-2xl font-bold">{analyticsData.mutualFunds.totalValue}</div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Total Return</div>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-green-500">{analyticsData.mutualFunds.totalReturn}</span>
                            <i className="ri-arrow-up-line text-green-500 ml-2"></i>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 rounded-lg p-4">
                          <div className="text-sm text-gray-400 mb-1">Asset Allocation</div>
                          <div className="mt-2 space-y-2">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Equity</span>
                                <span>{analyticsData.investmentAllocation.equity}%</span>
                              </div>
                              <Progress value={analyticsData.investmentAllocation.equity} className="h-2 bg-gray-600" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Debt</span>
                                <span>{analyticsData.investmentAllocation.debt}%</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-purple-500 rounded-full" 
                                  style={{ width: `${analyticsData.investmentAllocation.debt}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Cash</span>
                                <span>{analyticsData.investmentAllocation.cash}%</span>
                              </div>
                              <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full" 
                                  style={{ width: `${analyticsData.investmentAllocation.cash}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Investment Growth Chart */}
                  <Card className="bg-gray-800 border-gray-700 col-span-1 md:col-span-2">
                    <CardHeader>
                      <CardTitle>Investment Growth</CardTitle>
                      <CardDescription className="text-gray-400">Portfolio value over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <canvas ref={investmentGrowthChartRef}></canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Mutual Funds List */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Your Mutual Funds</CardTitle>
                    <CardDescription className="text-gray-400">Detailed breakdown of your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="py-3 px-4 text-left text-sm font-medium text-gray-400">Fund Name</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">Type</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">Value</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">Return</th>
                            <th className="py-3 px-4 text-right text-sm font-medium text-gray-400">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.mutualFunds.funds.map((fund, index) => (
                            <tr key={index} className="border-b border-gray-700">
                              <td className="py-3 px-4 text-sm">{fund.name}</td>
                              <td className="py-3 px-4 text-sm text-right">
                                <Badge 
                                  className={`${
                                    fund.type === 'Equity' ? 'bg-blue-600 hover:bg-blue-700' : 
                                    fund.type === 'Debt' ? 'bg-purple-600 hover:bg-purple-700' : 
                                    'bg-amber-600 hover:bg-amber-700'
                                  }`}
                                >
                                  {fund.type}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium">{fund.value}</td>
                              <td className="py-3 px-4 text-sm text-right font-medium text-green-500">{fund.return}</td>
                              <td className="py-3 px-4 text-right">
                                <Button variant="outline" size="sm" className="border-gray-600 hover:bg-gray-700">
                                  Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Portfolio Performance */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Portfolio Performance</CardTitle>
                    <CardDescription className="text-gray-400">Actual vs Predicted performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <canvas ref={portfolioPerformanceChartRef}></canvas>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Loans Tab */}
              <TabsContent value="loans" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Loan Trends */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>Loan Balance & Repayments</CardTitle>
                      <CardDescription className="text-gray-400">Monthly trend of loan balance and repayments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <canvas ref={loanTrendsChartRef}></canvas>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Loan Distribution */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>Loan Distribution by Type</CardTitle>
                      <CardDescription className="text-gray-400">Breakdown of your loans by purpose</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <canvas ref={loanDistributionChartRef}></canvas>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Loan Metrics */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Key Loan Metrics</CardTitle>
                    <CardDescription className="text-gray-400">Important indicators about your loans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Debt-to-Income Ratio</span>
                          <Badge className={`${analyticsData.financialHealth.debtToIncomeRatio < 30 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                            {analyticsData.financialHealth.debtToIncomeRatio < 30 ? 'Good' : 'Moderate'}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{analyticsData.financialHealth.debtToIncomeRatio}%</div>
                        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              analyticsData.financialHealth.debtToIncomeRatio < 30 ? 'bg-green-500' : 
                              analyticsData.financialHealth.debtToIncomeRatio < 40 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min(analyticsData.financialHealth.debtToIncomeRatio / 60 * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Credit Utilization</span>
                          <Badge className={`${analyticsData.financialHealth.creditUtilization < 30 ? 'bg-green-600' : 'bg-yellow-600'}`}>
                            {analyticsData.financialHealth.creditUtilization < 30 ? 'Excellent' : 'Good'}
                          </Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">{analyticsData.financialHealth.creditUtilization}%</div>
                        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              analyticsData.financialHealth.creditUtilization < 30 ? 'bg-green-500' : 
                              analyticsData.financialHealth.creditUtilization < 50 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`} 
                            style={{ width: `${analyticsData.financialHealth.creditUtilization}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">EMI to Income Ratio</span>
                          <Badge className="bg-green-600">Healthy</Badge>
                        </div>
                        <div className="text-2xl font-bold mb-1">22%</div>
                        <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${22 / 50 * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Loan Recommendations */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>Loan Recommendations</CardTitle>
                    <CardDescription className="text-gray-400">Suggestions to optimize your loans</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                        <h4 className="font-medium mb-1">Consolidation Opportunity</h4>
                        <p className="text-sm text-gray-400">Consolidate your multiple small loans into a single loan at 9.5% interest rate to save approximately ₹15,000 in interest payments.</p>
                        <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700">
                          Explore Options
                        </Button>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                        <h4 className="font-medium mb-1">Refinance Education Loan</h4>
                        <p className="text-sm text-gray-400">Your education loan can be refinanced at a 7.5% interest rate, down from current 8.9%, potentially saving ₹20,000 over the loan term.</p>
                        <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                          Check Eligibility
                        </Button>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-purple-500">
                        <h4 className="font-medium mb-1">Prepayment Advice</h4>
                        <p className="text-sm text-gray-400">Consider making a one-time prepayment of ₹50,000 on your home improvement loan to reduce the tenure by 8 months.</p>
                        <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                          Calculate Impact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Predictions Tab */}
              <TabsContent value="predictions" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financial Forecast */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>Financial Forecast</CardTitle>
                      <CardDescription className="text-gray-400">12-month projection of your financial status</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Net Worth Projection</span>
                            <span className="text-sm text-green-500">+18.5%</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full w-full mb-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: '75%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-center">
                              <div className="text-xs text-gray-400 mb-1">Current</div>
                              <div className="font-medium">₹15.2L</div>
                            </div>
                            <div className="flex-1 px-4">
                              <div className="h-0.5 w-full bg-gray-700 relative">
                                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-4 h-4 bg-blue-500 rounded-full -translate-y-1.5"></div>
                                <div className="absolute inset-y-0 left-1/4 flex items-center justify-center w-4 h-4 bg-blue-400 rounded-full -translate-y-1.5"></div>
                                <div className="absolute inset-y-0 left-1/2 flex items-center justify-center w-4 h-4 bg-blue-300 rounded-full -translate-y-1.5"></div>
                                <div className="absolute inset-y-0 left-3/4 flex items-center justify-center w-4 h-4 bg-green-400 rounded-full -translate-y-1.5"></div>
                                <div className="absolute inset-y-0 right-0 flex items-center justify-center w-4 h-4 bg-green-500 rounded-full -translate-y-1.5"></div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-400 mb-1">Projected</div>
                              <div className="font-medium text-green-500">₹18.0L</div>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="bg-gray-700" />
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Key Milestones</h4>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                              <i className="ri-home-4-line text-lg"></i>
                            </div>
                            <div>
                              <h5 className="font-medium">Home Loan Eligibility</h5>
                              <p className="text-xs text-gray-400">Projected to be eligible for a home loan of ₹40L by October 2025</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                              <i className="ri-funds-line text-lg"></i>
                            </div>
                            <div>
                              <h5 className="font-medium">Emergency Fund Complete</h5>
                              <p className="text-xs text-gray-400">On track to complete 6-month emergency fund by August 2025</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                              <i className="ri-bank-card-line text-lg"></i>
                            </div>
                            <div>
                              <h5 className="font-medium">Debt-Free Status</h5>
                              <p className="text-xs text-gray-400">Projected to be free of all personal debt by December 2025</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Market Trends */}
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle>Market Trends & Predictions</CardTitle>
                      <CardDescription className="text-gray-400">Insights for your investment strategy</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Equity Market Outlook</h4>
                            <Badge className="bg-green-600">Bullish</Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">The equity market is expected to grow by 12-15% in the next fiscal year, with technology and healthcare sectors outperforming.</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Impact on your portfolio:</span>
                            <span className="text-green-500">Potentially +17.3% returns</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Interest Rate Forecast</h4>
                            <Badge className="bg-yellow-600">Mixed</Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">Interest rates are expected to rise by 0.25-0.5% in the next two quarters, affecting debt fund returns and loan costs.</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Impact on your loans:</span>
                            <span className="text-yellow-500">+₹500/month on variable rate loans</span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">Recommended Actions</h4>
                          </div>
                          <ul className="text-sm text-gray-400 space-y-2">
                            <li className="flex items-start">
                              <i className="ri-arrow-right-circle-fill text-blue-500 mr-2 mt-0.5"></i>
                              <span>Increase allocation to large-cap equity funds by 5%</span>
                            </li>
                            <li className="flex items-start">
                              <i className="ri-arrow-right-circle-fill text-blue-500 mr-2 mt-0.5"></i>
                              <span>Consider locking in to fixed-rate loans before rate hikes</span>
                            </li>
                            <li className="flex items-start">
                              <i className="ri-arrow-right-circle-fill text-blue-500 mr-2 mt-0.5"></i>
                              <span>Add sectoral exposure to healthcare and technology</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* AI-Powered Scenarios */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle>AI-Powered Financial Scenarios</CardTitle>
                    <CardDescription className="text-gray-400">Impact of different financial decisions on your future</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <Button variant="outline" className="border-blue-600 bg-blue-600/10 hover:bg-blue-600/20 text-left justify-start p-4 h-auto">
                          <i className="ri-bank-line text-xl mr-3 text-blue-500"></i>
                          <div>
                            <h4 className="font-medium text-left mb-1">Home Purchase</h4>
                            <p className="text-xs text-gray-400 text-left font-normal">Impact of buying a home in the next 2 years</p>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="border-gray-700 hover:bg-gray-700 text-left justify-start p-4 h-auto">
                          <i className="ri-user-star-line text-xl mr-3 text-purple-500"></i>
                          <div>
                            <h4 className="font-medium text-left mb-1">Career Change</h4>
                            <p className="text-xs text-gray-400 text-left font-normal">Financial impact of a career transition</p>
                          </div>
                        </Button>
                        
                        <Button variant="outline" className="border-gray-700 hover:bg-gray-700 text-left justify-start p-4 h-auto">
                          <i className="ri-rocket-line text-xl mr-3 text-amber-500"></i>
                          <div>
                            <h4 className="font-medium text-left mb-1">Early Retirement</h4>
                            <p className="text-xs text-gray-400 text-left font-normal">Planning for retirement 5 years early</p>
                          </div>
                        </Button>
                      </div>
                      
                      <Card className="bg-gradient-to-r from-blue-900/40 to-blue-800/40 border-blue-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>Home Purchase Scenario</CardTitle>
                            <Badge className="bg-blue-600">Selected</Badge>
                          </div>
                          <CardDescription className="text-gray-300">Financial projection for a home purchase in 2 years</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-1">Down Payment Needed</div>
                                <div className="text-xl font-bold">₹15,00,000</div>
                                <div className="text-xs text-gray-400 mt-1">20% of ₹75L property value</div>
                              </div>
                              
                              <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-1">Monthly EMI</div>
                                <div className="text-xl font-bold">₹48,200</div>
                                <div className="text-xs text-gray-400 mt-1">At 8.5% for 20 years</div>
                              </div>
                              
                              <div className="bg-gray-800/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-1">Affordability Index</div>
                                <div className="text-xl font-bold text-yellow-500">68/100</div>
                                <div className="text-xs text-gray-400 mt-1">Moderate stretch on finances</div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-800/50 rounded-lg p-4">
                              <h4 className="font-medium mb-3">How to Prepare</h4>
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Current Savings</span>
                                    <span>₹4,50,000 / ₹15,00,000</span>
                                  </div>
                                  <Progress value={30} className="h-2 bg-gray-700" indicatorClassName="bg-blue-500" />
                                </div>
                                
                                <div>
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Monthly Saving Needed</span>
                                    <span className="text-yellow-500">₹43,750 for 24 months</span>
                                  </div>
                                  <div className="text-xs text-gray-400">This represents 32% of your current monthly income</div>
                                </div>
                                
                                <Button className="mt-2 bg-blue-600 hover:bg-blue-700">
                                  Create Savings Plan
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}