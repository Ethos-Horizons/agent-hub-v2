'use client'
import { useState } from 'react'
import { 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Settings,
  ExternalLink,
  Clock,
  Activity,
  Download,
  Upload,
  Link,
  Database
} from 'lucide-react'

// Mock n8n integration data
const n8nStatus = {
  connected: true,
  baseUrl: 'https://your-instance.app.n8n.cloud',
  lastSync: '2024-01-15T14:30:45Z',
  totalWorkflows: 5,
  activeWorkflows: 3,
  lastError: null
}

const workflows = [
  {
    id: 'wf_001',
    name: 'Conversational Agent',
    n8nId: '12345',
    status: 'active',
    lastTriggered: '2024-01-15T14:30:22Z',
    executions: 156,
    successRate: 94.9,
    avgDuration: 2100,
    webhook: 'https://your-instance.app.n8n.cloud/webhook/conversational',
    agentId: 'agent_conv'
  },
  {
    id: 'wf_002', 
    name: 'Appointment Scheduling',
    n8nId: '12346',
    status: 'active',
    lastTriggered: '2024-01-15T14:25:10Z',
    executions: 67,
    successRate: 97.0,
    avgDuration: 3200,
    webhook: 'https://your-instance.app.n8n.cloud/webhook/scheduling',
    agentId: 'agent_sched'
  },
  {
    id: 'wf_003',
    name: 'Form-Filling Agent',
    n8nId: '12347', 
    status: 'paused',
    lastTriggered: '2024-01-15T13:45:32Z',
    executions: 24,
    successRate: 87.5,
    avgDuration: 4100,
    webhook: 'https://your-instance.app.n8n.cloud/webhook/form-filling',
    agentId: 'agent_form'
  },
  {
    id: 'wf_004',
    name: 'Research Agent',
    n8nId: '12348',
    status: 'development',
    lastTriggered: '2024-01-15T12:15:45Z',
    executions: 8,
    successRate: 100,
    avgDuration: 5800,
    webhook: 'https://your-instance.app.n8n.cloud/webhook/research',
    agentId: 'agent_research'
  },
  {
    id: 'wf_005',
    name: 'Email Notification Pipeline',
    n8nId: '12349',
    status: 'active',
    lastTriggered: '2024-01-15T14:28:15Z',
    executions: 89,
    successRate: 98.9,
    avgDuration: 1200,
    webhook: 'https://your-instance.app.n8n.cloud/webhook/email-pipeline',
    agentId: null // Support workflow, not a direct agent
  }
]

const statusConfig = {
  active: { 
    icon: CheckCircle, 
    color: 'text-green-400', 
    bg: 'bg-green-400/10',
    label: 'Active'
  },
  paused: { 
    icon: Pause, 
    color: 'text-yellow-400', 
    bg: 'bg-yellow-400/10',
    label: 'Paused'
  },
  development: { 
    icon: Settings, 
    color: 'text-blue-400', 
    bg: 'bg-blue-400/10',
    label: 'Development'
  },
  error: { 
    icon: XCircle, 
    color: 'text-red-400', 
    bg: 'bg-red-400/10',
    label: 'Error'
  }
}

export default function N8nSyncPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const handleWorkflowAction = (workflowId: string, action: string) => {
    console.log(`${action} workflow:`, workflowId)
    // Implement workflow actions (pause, resume, test)
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">n8n Sync</h1>
          <p className="text-zinc-400">Manage n8n workflow integration and monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </button>
          <a
            href={n8nStatus.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
          >
            <ExternalLink className="h-4 w-4" />
            Open n8n
          </a>
        </div>
      </div>

      {/* Connection Status */}
      <div className="bg-zinc-900/75 rounded-lg border border-zinc-800 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              n8nStatus.connected ? 'bg-green-400/10' : 'bg-red-400/10'
            }`}>
              <Zap className={`h-6 w-6 ${n8nStatus.connected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">n8n Connection</h3>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  n8nStatus.connected ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-sm text-zinc-400">
                  {n8nStatus.connected ? 'Connected' : 'Disconnected'} • Last sync: {new Date(n8nStatus.lastSync).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-400">Base URL</div>
            <a 
              href={n8nStatus.baseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-mono text-cyan-400 hover:text-cyan-300"
            >
              {n8nStatus.baseUrl}
            </a>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Workflows</p>
              <p className="text-2xl font-bold text-white">{n8nStatus.totalWorkflows}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Database className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Active Workflows</p>
              <p className="text-2xl font-bold text-white">{n8nStatus.activeWorkflows}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Executions</p>
              <p className="text-2xl font-bold text-white">
                {workflows.reduce((acc, wf) => acc + wf.executions, 0)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/10">
              <Play className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {formatPercentage(
                  workflows.reduce((acc, wf) => acc + wf.successRate, 0) / workflows.length
                )}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-400/10">
              <CheckCircle className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-zinc-900/75 rounded-lg border border-zinc-800">
        <div className="p-6 border-b border-zinc-800">
          <h3 className="text-lg font-semibold text-white">n8n Workflows</h3>
          <p className="text-sm text-zinc-400">Connected workflows and their current status</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Workflow</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Executions</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Success Rate</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Avg Duration</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Last Triggered</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((workflow) => {
                const StatusIcon = statusConfig[workflow.status as keyof typeof statusConfig].icon
                return (
                  <tr key={workflow.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-cyan-400" />
                          <span className="text-sm font-medium text-white">{workflow.name}</span>
                        </div>
                        <div className="text-xs text-zinc-500 font-mono">ID: {workflow.n8nId}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-2 px-2 py-1 rounded-lg w-fit ${statusConfig[workflow.status as keyof typeof statusConfig].bg}`}>
                        <StatusIcon className={`h-4 w-4 ${statusConfig[workflow.status as keyof typeof statusConfig].color}`} />
                        <span className={`text-sm ${statusConfig[workflow.status as keyof typeof statusConfig].color}`}>
                          {statusConfig[workflow.status as keyof typeof statusConfig].label}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">{workflow.executions}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-300">{formatPercentage(workflow.successRate)}</span>
                        <div className="flex h-2 w-12 rounded-full bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-green-400 transition-all duration-500"
                            style={{ width: `${workflow.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">{formatDuration(workflow.avgDuration)}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span className="text-sm text-zinc-300">
                          {new Date(workflow.lastTriggered).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedWorkflow(workflow)}
                          className="flex items-center gap-1 px-2 py-1 text-cyan-400 hover:bg-cyan-400/10 rounded text-xs"
                        >
                          <Settings className="h-3 w-3" />
                          View
                        </button>
                        <a
                          href={`${n8nStatus.baseUrl}/workflow/${workflow.n8nId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:bg-zinc-700 rounded text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          n8n
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Details Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Workflow Configuration</h3>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Workflow Name</h4>
                  <span className="text-sm text-white">{selectedWorkflow.name}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">n8n ID</h4>
                  <span className="text-sm font-mono text-white">{selectedWorkflow.n8nId}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Webhook URL</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-cyan-400 break-all">{selectedWorkflow.webhook}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(selectedWorkflow.webhook)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Connected Agent</h4>
                  <span className="text-sm text-white">{selectedWorkflow.agentId || 'No agent mapping'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-zinc-400">Actions</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleWorkflowAction(selectedWorkflow.id, 'test')}
                    className="px-3 py-2 bg-cyan-400 text-black rounded hover:bg-cyan-300 text-sm"
                  >
                    Test Workflow
                  </button>
                  <button
                    onClick={() => handleWorkflowAction(selectedWorkflow.id, 'pause')}
                    className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 text-sm"
                  >
                    {selectedWorkflow.status === 'active' ? 'Pause' : 'Resume'}
                  </button>
                  <a
                    href={`${n8nStatus.baseUrl}/workflow/${selectedWorkflow.n8nId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-zinc-700 text-white rounded hover:bg-zinc-600 text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Edit in n8n
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
