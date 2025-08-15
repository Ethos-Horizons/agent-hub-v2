import { 
  Bot, 
  Play, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  XCircle,
  Activity,
  Zap
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Orchestration Dashboard</h1>
          <p className="text-zinc-400">Monitor and manage your n8n-designed automation agents</p>
        </div>
        <div className="text-sm text-zinc-400">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Active Agents</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
            <span className="text-zinc-400">3 of 4 online</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">API Calls Today</p>
              <p className="text-2xl font-bold text-white">47</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/10">
              <Play className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-green-400">+12</span>
            <span className="text-zinc-400 ml-1">vs yesterday</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">96.8%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <CheckCircle className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-green-400">+1.2%</span>
            <span className="text-zinc-400 ml-1">this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">n8n Sync</p>
              <p className="text-2xl font-bold text-white">✓</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <Zap className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="h-2 w-2 rounded-full bg-green-400 mr-2"></div>
            <span className="text-zinc-400">Connected</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Activity Chart */}
        <div className="metric-chart">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Agent API Calls</h3>
            <p className="text-sm text-zinc-400">Last 7 days activity</p>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[65, 78, 52, 89, 94, 76, 82].map((height, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div 
                  className="w-8 bg-gradient-to-t from-cyan-400 to-cyan-300 rounded-t"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-zinc-400">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="metric-chart">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Agent Status</h3>
            <p className="text-sm text-zinc-400">Current distribution</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-400"></div>
                <span className="text-zinc-300">Active</span>
              </div>
              <span className="text-white font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-zinc-400"></div>
                <span className="text-zinc-300">Paused</span>
              </div>
              <span className="text-white font-medium">1</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <span className="text-zinc-300">Errors</span>
              </div>
              <span className="text-white font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-cyan-400"></div>
                <span className="text-zinc-300">n8n Synced</span>
              </div>
              <span className="text-white font-medium">4</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="metric-chart">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Recent API Calls</h3>
          <p className="text-sm text-zinc-400">Latest agent executions from external apps</p>
        </div>
        <div className="space-y-4">
          {[
            { agent: 'Conversational Agent', status: 'success', time: '2 minutes ago', duration: '1.4s', source: 'Website Chat' },
            { agent: 'Appointment Scheduler', status: 'success', time: '8 minutes ago', duration: '2.3s', source: 'Customer Portal' },
            { agent: 'Research Agent', status: 'running', time: '12 minutes ago', duration: '...', source: 'Internal Dashboard' },
            { agent: 'Form Filling Agent', status: 'success', time: '18 minutes ago', duration: '3.1s', source: 'Lead System' },
            { agent: 'Conversational Agent', status: 'success', time: '25 minutes ago', duration: '1.8s', source: 'Mobile App' },
          ].map((run, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-800 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  run.status === 'success' ? 'bg-green-400/10' :
                  run.status === 'running' ? 'bg-yellow-400/10' :
                  'bg-red-400/10'
                }`}>
                  {run.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : run.status === 'running' ? (
                    <Activity className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{run.agent}</div>
                  <div className="text-sm text-zinc-400">Called from {run.source} • {run.time}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  run.status === 'success' ? 'text-green-400' :
                  run.status === 'running' ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                </div>
                <div className="text-xs text-zinc-400">{run.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
