'use client'
import { useState } from 'react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  Bot,
  Zap,
  Timer
} from 'lucide-react'

// Mock data for agent runs
const runs = [
  {
    id: 'run_001',
    agentId: 'agent_conv',
    agentName: 'Conversational Agent',
    status: 'completed',
    startTime: '2024-01-15T14:30:22Z',
    endTime: '2024-01-15T14:30:45Z',
    duration: 23000, // ms
    input: { message: 'What services do you offer?', session_id: 'sess_123' },
    output: { message: 'We offer comprehensive digital marketing services...', tokens_used: 145 },
    cost: 0.023,
    source: 'Website Chat',
    sessionId: 'sess_123'
  },
  {
    id: 'run_002', 
    agentId: 'agent_sched',
    agentName: 'Appointment Scheduling Agent',
    status: 'completed',
    startTime: '2024-01-15T14:25:10Z',
    endTime: '2024-01-15T14:25:32Z',
    duration: 22000,
    input: { message: 'Schedule a consultation', contact: { email: 'user@example.com' } },
    output: { message: 'I\'ve scheduled your consultation...', booking_id: 'cal_456' },
    cost: 0.019,
    source: 'Contact Form',
    sessionId: 'sess_124'
  },
  {
    id: 'run_003',
    agentId: 'agent_form',
    agentName: 'Form-Filling Agent',
    status: 'processing',
    startTime: '2024-01-15T14:28:15Z',
    endTime: null,
    duration: null,
    input: { conversation_summary: 'Client needs SEO services for e-commerce', contact_info: {} },
    output: null,
    cost: 0.000,
    source: 'Agent Pipeline',
    sessionId: 'sess_125'
  },
  {
    id: 'run_004',
    agentId: 'agent_conv',
    agentName: 'Conversational Agent', 
    status: 'error',
    startTime: '2024-01-15T14:20:08Z',
    endTime: '2024-01-15T14:20:15Z',
    duration: 7000,
    input: { message: 'Hello there', session_id: 'sess_126' },
    output: null,
    cost: 0.005,
    error: 'n8n workflow timeout',
    source: 'Website Chat',
    sessionId: 'sess_126'
  },
]

const statusConfig = {
  completed: { 
    icon: CheckCircle, 
    color: 'text-green-400', 
    bg: 'bg-green-400/10',
    label: 'Completed'
  },
  processing: { 
    icon: Clock, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-400/10',
    label: 'Processing'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-400/10',
    label: 'Error'
  }
}

export default function RunsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRun, setSelectedRun] = useState<any>(null)

  const filteredRuns = runs.filter(run => {
    const matchesStatus = selectedStatus === 'all' || run.status === selectedStatus
    const matchesSearch = searchTerm === '' || 
      run.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.source.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(3)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Agent Runs</h1>
          <p className="text-zinc-400">Monitor agent execution history and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Runs</p>
              <p className="text-2xl font-bold text-white">{runs.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Play className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">75%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Avg Duration</p>
              <p className="text-2xl font-bold text-white">17.3s</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/10">
              <Timer className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Cost</p>
              <p className="text-2xl font-bold text-white">$0.047</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-400/10">
              <Zap className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search runs by agent, ID, or source..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-zinc-900/75 rounded-lg border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Run ID</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Agent</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Duration</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Cost</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Source</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Started</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRuns.map((run) => {
                const StatusIcon = statusConfig[run.status as keyof typeof statusConfig].icon
                return (
                  <tr key={run.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <span className="text-sm font-mono text-white">{run.id}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm text-white">{run.agentName}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg w-fit ${statusConfig[run.status as keyof typeof statusConfig].bg}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig[run.status as keyof typeof statusConfig].color}`} />
                        <span className={`text-sm ${statusConfig[run.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[run.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">{formatDuration(run.duration)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">{formatCost(run.cost)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">{run.source}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">
                        {new Date(run.startTime).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedRun(run)}
                        className="flex items-center gap-1 px-2 py-1 text-cyan-400 hover:bg-cyan-400/10 rounded"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Run Details Modal (simplified) */}
      {selectedRun && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Run Details</h3>
                <button
                  onClick={() => setSelectedRun(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Input</h4>
                <pre className="text-sm bg-zinc-800 p-3 rounded text-green-400 overflow-auto">
                  {JSON.stringify(selectedRun.input, null, 2)}
                </pre>
              </div>
              {selectedRun.output && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Output</h4>
                  <pre className="text-sm bg-zinc-800 p-3 rounded text-blue-400 overflow-auto">
                    {JSON.stringify(selectedRun.output, null, 2)}
                  </pre>
                </div>
              )}
              {selectedRun.error && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Error</h4>
                  <div className="text-sm bg-red-400/10 border border-red-400/20 p-3 rounded text-red-400">
                    {selectedRun.error}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
