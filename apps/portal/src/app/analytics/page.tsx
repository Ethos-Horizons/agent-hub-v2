'use client'
import { 
  TrendingUp, 
  Activity,
  Clock,
  DollarSign,
  Bot,
  MessageSquare,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'

// Mock analytics data
const analyticsData = {
  overview: {
    totalRuns: 247,
    successRate: 94.2,
    avgResponseTime: 2.8,
    totalCost: 12.45,
    activeAgents: 3,
    uniqueSessions: 89
  },
  trends: {
    daily: [
      { date: '2024-01-10', runs: 23, success: 21, errors: 2, cost: 1.2 },
      { date: '2024-01-11', runs: 31, success: 29, errors: 2, cost: 1.8 },
      { date: '2024-01-12', runs: 28, success: 26, errors: 2, cost: 1.5 },
      { date: '2024-01-13', runs: 35, success: 33, errors: 2, cost: 2.1 },
      { date: '2024-01-14', runs: 42, success: 40, errors: 2, cost: 2.3 },
      { date: '2024-01-15', runs: 38, success: 36, errors: 2, cost: 1.9 },
      { date: '2024-01-16', runs: 50, success: 47, errors: 3, cost: 2.6 }
    ]
  },
  agentPerformance: [
    { name: 'Conversational Agent', runs: 156, success: 94.9, avgTime: 2.1, cost: 7.82 },
    { name: 'Appointment Scheduling', runs: 67, success: 97.0, avgTime: 3.2, cost: 3.21 },
    { name: 'Form-Filling Agent', runs: 24, success: 87.5, avgTime: 4.1, cost: 1.42 }
  ],
  sources: [
    { name: 'Website Chat', percentage: 67, runs: 165 },
    { name: 'Contact Form', percentage: 23, runs: 57 },
    { name: 'Agent Pipeline', percentage: 10, runs: 25 }
  ]
}

export default function AnalyticsPage() {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`
  const formatTime = (value: number) => `${value.toFixed(1)}s`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-400">Performance insights and metrics for your agents</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Runs</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.totalRuns}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Activity className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-400">
            +12% from last week
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{formatPercentage(analyticsData.overview.successRate)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-400">
            +2.1% improvement
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Avg Response</p>
              <p className="text-2xl font-bold text-white">{formatTime(analyticsData.overview.avgResponseTime)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/10">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-400">
            -0.3s faster
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Cost</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.overview.totalCost)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-400/10">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-yellow-400">
            +8% from last week
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Active Agents</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.activeAgents}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-400/10">
              <Bot className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-zinc-400">
            2 in development
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Sessions</p>
              <p className="text-2xl font-bold text-white">{analyticsData.overview.uniqueSessions}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-400/10">
              <Users className="h-6 w-6 text-pink-400" />
            </div>
          </div>
          <div className="mt-2 text-sm text-green-400">
            +15% growth
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <div className="metric-chart">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Daily Activity</h3>
            <BarChart3 className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="space-y-4">
            {analyticsData.trends.daily.slice(-5).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-zinc-400 w-12">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 bg-zinc-800 rounded-full w-32 overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-500"
                          style={{ width: `${(day.runs / 50) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-white font-medium">{day.runs}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="metric-chart">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Traffic Sources</h3>
            <PieChart className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="space-y-4">
            {analyticsData.sources.map((source, index) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-cyan-400' : 
                    index === 1 ? 'bg-blue-400' : 'bg-purple-400'
                  }`} />
                  <span className="text-sm text-zinc-300">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-zinc-400">{source.runs} runs</span>
                  <span className="text-sm font-medium text-white">{source.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-zinc-900/75 rounded-lg border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">Agent Performance</h3>
          <p className="text-sm text-zinc-400">Detailed metrics for each agent</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Agent</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Runs</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Success Rate</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Avg Time</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Total Cost</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.agentPerformance.map((agent, index) => (
                <tr key={agent.name} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{agent.runs}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-300">{formatPercentage(agent.success)}</span>
                      <div className="flex h-2 w-16 rounded-full bg-zinc-800 overflow-hidden">
                        <div 
                          className="h-full bg-green-400 transition-all duration-500"
                          style={{ width: `${agent.success}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{formatTime(agent.avgTime)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-zinc-300">{formatCurrency(agent.cost)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">+{(Math.random() * 10 + 5).toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
