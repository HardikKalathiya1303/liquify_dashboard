interface Stat {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface QuickStatsProps {
  stats: Stat[];
}

export default function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-dark-card rounded-xl p-6 transition-all hover:shadow-lg hover:bg-dark-card-hover"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-semibold mt-1 text-white">{stat.value}</h3>
              {stat.change && (
                <p className={`text-sm font-medium mt-2 flex items-center ${
                  stat.changeType === 'increase' ? 'text-green-500' : 
                  stat.changeType === 'decrease' ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {stat.changeType === 'increase' && <i className="ri-arrow-up-s-line mr-1"></i>}
                  {stat.changeType === 'decrease' && <i className="ri-arrow-down-s-line mr-1"></i>}
                  {stat.changeType === 'neutral' && <i className="ri-checkbox-circle-line mr-1"></i>}
                  {stat.change}
                </p>
              )}
            </div>
            <div className={`w-12 h-12 bg-${stat.color}-500 bg-opacity-20 rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} text-${stat.color}-500 text-2xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
