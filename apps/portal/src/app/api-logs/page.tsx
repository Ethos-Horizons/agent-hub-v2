'use client'
import { useState } from 'react'
import { 
  Database,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Download
} from 'lucide-react'

// Mock API log data
const apiLogs = [
  {
    id: 'log_001',
    timestamp: '2024-01-15T14:30:45.123Z',
    method: 'POST',
    endpoint: '/api/v1/conversation',
    statusCode: 200,
    responseTime: 1230,
    requestSize: 245,
    responseSize: 412,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: '192.168.1.100',
    tenantId: 'tenant_123',
    sessionId: 'sess_456',
    requestId: 'req_789',
    request: {
      message: 'What services do you offer?',
      session_id: 'sess_456',
      context: { page: '/services' }
    },
    response: {
      id: 'conv_001',
      message: 'Processing your message...',
      status: 'processing'
    }
  },
  {
    id: 'log_002',
    timestamp: '2024-01-15T14:30:42.789Z',
    method: 'GET',
    endpoint: '/api/v1/conversation/conv_001',
    statusCode: 200,
    responseTime: 145,
    requestSize: 0,
    responseSize: 523,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    ip: '192.168.1.100',
    tenantId: 'tenant_123',
    sessionId: 'sess_456',
    requestId: 'req_790',
    request: null,
    response: {
      id: 'conv_001',
      message: 'We offer comprehensive digital marketing services...',
      status: 'completed'
    }
  },
  {
    id: 'log_003',
    timestamp: '2024-01-15T14:29:15.456Z',
    method: 'POST',
    endpoint: '/api/v1/webhooks/n8n',
    statusCode: 401,
    responseTime: 12,
    requestSize: 150,
    responseSize: 45,
    userAgent: 'n8n/1.0',
    ip: '10.0.0.50',
    tenantId: null,
    sessionId: null,
    requestId: 'req_791',
    request: {
      runId: 'run_001',
      status: 'success'
    },
    response: {
      error: 'Invalid webhook signature'
    }
  },
  {
    id: 'log_004',
    timestamp: '2024-01-15T14:28:30.789Z',
    method: 'GET',
    endpoint: '/api/health',
    statusCode: 200,
    responseTime: 8,
    requestSize: 0,
    responseSize: 89,
    userAgent: 'UptimeRobot/2.0',
    ip: '69.162.124.224',
    tenantId: null,
    sessionId: null,
    requestId: 'req_792',
    request: null,
    response: {
      status: 'healthy',
      timestamp: '2024-01-15T14:28:30.789Z'
    }
  }
]

const statusConfig = {
  200: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Success' },
  201: { color: 'text-green-400', bg: 'bg-green-400/10', label: 'Created' },
  400: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Bad Request' },
  401: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Unauthorized' },
  403: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Forbidden' },
  404: { color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Not Found' },
  500: { color: 'text-red-400', bg: 'bg-red-400/10', label: 'Server Error' }
}

const methodColors = {
  GET: 'text-blue-400 bg-blue-400/10',
  POST: 'text-green-400 bg-green-400/10',
  PUT: 'text-yellow-400 bg-yellow-400/10',
  DELETE: 'text-red-400 bg-red-400/10',
  PATCH: 'text-purple-400 bg-purple-400/10'
}

export default function ApiLogsPage() {
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  const filteredLogs = apiLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.endpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.requestId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || log.statusCode.toString() === statusFilter
    const matchesMethod = methodFilter === 'all' || log.method === methodFilter
    
    return matchesSearch && matchesStatus && matchesMethod
  })

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">API Logs</h1>
          <p className="text-zinc-400">Monitor API requests, responses, and performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
            <Download className="h-4 w-4" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Requests</p>
              <p className="text-2xl font-bold text-white">{apiLogs.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Database className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">
                {((apiLogs.filter(log => log.statusCode < 400).length / apiLogs.length) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Avg Response</p>
              <p className="text-2xl font-bold text-white">
                {formatResponseTime(Math.round(apiLogs.reduce((acc, log) => acc + log.responseTime, 0) / apiLogs.length))}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-400/10">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Errors</p>
              <p className="text-2xl font-bold text-white">
                {apiLogs.filter(log => log.statusCode >= 400).length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-400/10">
              <XCircle className="h-6 w-6 text-red-400" />
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
            placeholder="Search by endpoint, IP, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">All Status</option>
            <option value="200">2xx Success</option>
            <option value="400">4xx Client Error</option>
            <option value="500">5xx Server Error</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/75 rounded-lg border border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Time</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Method</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Endpoint</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Response Time</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Size</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">IP</th>
                <th className="text-left p-4 text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => {
                const statusInfo = statusConfig[log.statusCode as keyof typeof statusConfig] || statusConfig[500]
                return (
                  <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-4">
                      <span className="text-sm text-zinc-300">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${methodColors[log.method as keyof typeof methodColors]}`}>
                        {log.method}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-white">{log.endpoint}</span>
                    </td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded w-fit ${statusInfo.bg}`}>
                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                          {log.statusCode}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${log.responseTime > 1000 ? 'text-yellow-400' : 'text-zinc-300'}`}>
                        {formatResponseTime(log.responseTime)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-zinc-300">
                        <div>{formatBytes(log.responseSize)}</div>
                        <div className="text-xs text-zinc-500">{formatBytes(log.requestSize)} req</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-mono text-zinc-300">{log.ip}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="flex items-center gap-1 px-2 py-1 text-cyan-400 hover:bg-cyan-400/10 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => copyToClipboard(log.requestId)}
                          className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:bg-zinc-700 rounded"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 w-full max-w-4xl max-h-[80vh] overflow-auto">
            <div className="p-6 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Request Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-zinc-400 hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Request ID</h4>
                  <span className="text-sm font-mono text-white">{selectedLog.requestId}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Timestamp</h4>
                  <span className="text-sm text-white">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">User Agent</h4>
                  <span className="text-sm text-white break-all">{selectedLog.userAgent}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Session ID</h4>
                  <span className="text-sm font-mono text-white">{selectedLog.sessionId || 'N/A'}</span>
                </div>
              </div>

              {/* Request Body */}
              {selectedLog.request && (
                <div>
                  <h4 className="text-sm font-medium text-zinc-400 mb-2">Request Body</h4>
                  <pre className="text-sm bg-zinc-800 p-3 rounded text-green-400 overflow-auto">
                    {JSON.stringify(selectedLog.request, null, 2)}
                  </pre>
                </div>
              )}

              {/* Response Body */}
              <div>
                <h4 className="text-sm font-medium text-zinc-400 mb-2">Response Body</h4>
                <pre className="text-sm bg-zinc-800 p-3 rounded text-blue-400 overflow-auto">
                  {JSON.stringify(selectedLog.response, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
