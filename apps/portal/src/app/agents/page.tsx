'use client'
import { 
  Bot, 
  Plus, 
  Play, 
  Pause, 
  MoreVertical, 
  Calendar,
  TrendingUp,
  Activity,
  Zap,
  Settings
} from 'lucide-react'

// Foundation MVP Agents (Phase 1)
const agents = [
  {
    id: 1,
    name: 'Conversational Agent',
    description: 'Customer interaction, qualification, and initial engagement',
    category: 'Customer Interaction',
    status: 'active',
    runs: 47,
    successRate: 94.2,
    lastRun: '2 minutes ago',
    enabled: true,
  },
  {
    id: 2,
    name: 'Appointment Scheduling Agent',
    description: 'Meeting coordination and booking management',
    category: 'Scheduling',
    status: 'active',
    runs: 23,
    successRate: 97.8,
    lastRun: '8 minutes ago',
    enabled: true,
  },
  {
    id: 3,
    name: 'Form-Filling Agent',
    description: 'Automated client intake based on conversation summaries',
    category: 'Data Processing',
    status: 'development',
    runs: 12,
    successRate: 91.7,
    lastRun: '45 minutes ago',
    enabled: false,
  },
  {
    id: 4,
    name: 'Research Agent',
    description: 'Client analysis and consultation preparation',
    category: 'Intelligence',
    status: 'development',
    runs: 8,
    successRate: 100,
    lastRun: '1 hour ago',
    enabled: false,
  },
]

const categoryColors = {
  'Customer Interaction': 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
  'Scheduling': 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  'Data Processing': 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  'Intelligence': 'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Foundation Agents</h1>
          <p className="text-zinc-400">Core MVP agents for customer interaction and business automation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium">
          <Plus className="h-4 w-4" />
          Create Agent
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Foundation Agents</p>
              <p className="text-2xl font-bold text-white">4</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <Bot className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Active (Production)</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-400/10">
              <Activity className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">In Development</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-400/10">
              <Zap className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-400">Total Executions</p>
              <p className="text-2xl font-bold text-white">90</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
              <TrendingUp className="h-6 w-6 text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {agents.map((agent) => (
          <div key={agent.id} className="stat-card group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
                  <Bot className="h-6 w-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full border
                      ${categoryColors[agent.category as keyof typeof categoryColors] || categoryColors['Customer Interaction']}
                    `}>
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{agent.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-zinc-500">Runs</p>
                      <p className="text-white font-medium">{agent.runs}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Success Rate</p>
                      <p className="text-white font-medium">{agent.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-zinc-500">Last Run</p>
                      <p className="text-white font-medium">{agent.lastRun}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Status indicator */}
                <div className={`
                  flex h-2 w-2 rounded-full
                  ${agent.status === 'active' ? 'bg-green-400' : 
                    agent.status === 'development' ? 'bg-orange-400' : 'bg-zinc-500'}
                `}></div>
                
                <button className="p-1 text-zinc-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <button 
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${agent.enabled 
                      ? 'bg-zinc-800 text-zinc-300 hover:text-white' 
                      : 'bg-cyan-400/10 text-cyan-400 hover:bg-cyan-400/20'
                    }
                  `}
                >
                  {agent.enabled ? (
                    <>
                      <Pause className="h-3 w-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Resume
                    </>
                  )}
                </button>
                
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-cyan-400 text-black hover:bg-cyan-300 transition-colors">
                  <Play className="h-3 w-3" />
                  Try Agent
                </button>
              </div>
              
              <button className="p-1.5 text-zinc-400 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Need Custom Agent Card */}
      <div className="stat-card border-dashed border-zinc-600">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-400/10">
            <Plus className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">Need a custom agent?</h3>
            <p className="text-sm text-zinc-400 mb-3">
              Contact our team to build custom automation agents tailored to your specific business needs.
            </p>
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
              Get in touch →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}