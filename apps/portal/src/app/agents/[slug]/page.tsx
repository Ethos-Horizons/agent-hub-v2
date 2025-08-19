'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  GitBranch, 
  Play, 
  Settings, 
  Copy, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Agent, AgentVersion, AgentBinding } from '@/features/agents/types';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';

type TabType = 'overview' | 'versions' | 'parameters' | 'bindings';

export default function AgentDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [versions, setVersions] = useState<AgentVersion[]>([]);
  const [bindings, setBindings] = useState<AgentBinding[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [showCreateVersion, setShowCreateVersion] = useState(false);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    setTimeout(() => {
      setAgent({
        id: '1',
        tenant_id: 'user1',
        name: 'Content Generator',
        kind: 'local',
        slug: 'content-generator',
        description: 'Generates blog posts and social media content based on prompts and parameters',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      });
      
      setVersions([
        {
          id: 'v1',
          agent_id: '1',
          version: '1.0.0',
          system_prompt: 'You are a professional content writer specializing in blog posts and social media content. Generate engaging, informative content based on the provided topic and requirements.',
          default_params: {
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.9,
          },
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          id: 'v2',
          agent_id: '1',
          version: '1.1.0',
          system_prompt: 'You are a professional content writer specializing in blog posts and social media content. Generate engaging, informative content based on the provided topic and requirements. Focus on SEO optimization and include relevant keywords naturally.',
          default_params: {
            temperature: 0.8,
            max_tokens: 1200,
            top_p: 0.95,
          },
          status: 'draft',
          created_at: '2024-01-20T14:30:00Z',
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, [slug]);

  const getStatusIcon = (status: AgentVersion['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'deprecated':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getStatusColor = (status: AgentVersion['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'deprecated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Settings className="w-4 h-4" /> },
    { id: 'versions', label: 'Versions', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'parameters', label: 'Parameters', icon: <Settings className="w-4 h-4" /> },
    { id: 'bindings', label: 'Bindings', icon: <Copy className="w-4 h-4" /> },
  ];

  if (loading || !agent) {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
            <div className="h-64 bg-zinc-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/agents"
              className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-cyan-400">{agent.name}</h1>
              <p className="text-xl text-zinc-400 mt-2">{agent.description}</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="px-6 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Run
            </button>
          </div>
        </div>

        {/* Agent Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-400">Type</p>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                agent.kind === 'n8n' 
                  ? 'bg-blue-500/10 text-blue-400' 
                  : 'bg-cyan-400/10 text-cyan-400'
              )}>
                {agent.kind === 'n8n' ? 'n8n Workflow' : 'Local AI'}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-50">{agent.kind}</p>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-400 mb-2">Active Version</p>
            <p className="text-2xl font-bold text-slate-50">
              {versions.find(v => v.status === 'active')?.version || 'None'}
            </p>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-400 mb-2">Total Versions</p>
            <p className="text-2xl font-bold text-slate-50">{versions.length}</p>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <p className="text-sm text-zinc-400 mb-2">Last Updated</p>
            <p className="text-2xl font-bold text-slate-50">
              {formatRelativeTime(agent.updated_at)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg">
          <div className="border-b border-zinc-800">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-zinc-400 hover:text-zinc-300'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-4">Agent Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                      <p className="text-slate-50">{agent.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Slug</label>
                      <p className="text-slate-50 font-mono">{agent.slug}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                      <p className="text-slate-50">{agent.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Created</label>
                      <p className="text-slate-50">{formatDate(agent.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-slate-50 mb-4">Quick Actions</h3>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors">
                      Test Agent
                    </button>
                    <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors">
                      View Logs
                    </button>
                    <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors">
                      Export
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Versions Tab */}
            {activeTab === 'versions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-50">Version History</h3>
                  <button
                    onClick={() => setShowCreateVersion(true)}
                    className="px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors"
                  >
                    New Version
                  </button>
                </div>

                <div className="space-y-4">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-slate-50">
                            v{version.version}
                          </span>
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            getStatusColor(version.status)
                          )}>
                            {getStatusIcon(version.status)}
                            <span className="ml-1">{version.status}</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {version.status === 'draft' && (
                            <button className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
                              Activate
                            </button>
                          )}
                          <button className="px-3 py-1 bg-zinc-800 text-slate-50 text-sm rounded hover:bg-zinc-700 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-zinc-800 text-slate-50 text-sm rounded hover:bg-zinc-700 transition-colors">
                            Duplicate
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">System Prompt</label>
                          <p className="text-sm text-slate-50 bg-zinc-800 p-3 rounded font-mono">
                            {version.system_prompt}
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-1">Default Parameters</label>
                          <pre className="text-sm text-slate-50 bg-zinc-800 p-3 rounded overflow-x-auto">
                            {JSON.stringify(version.default_params, null, 2)}
                          </pre>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-zinc-400">
                          <span>Created {formatDate(version.created_at)}</span>
                          <span>Parameters: {Object.keys(version.default_params).length}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Parameters Tab */}
            {activeTab === 'parameters' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-slate-50">Agent Parameters</h3>
                <p className="text-zinc-400">
                  Configure the default parameters for this agent. These can be overridden at runtime.
                </p>
                
                <div className="bg-zinc-800 rounded-lg p-6">
                  <p className="text-center text-zinc-400">
                    Parameter configuration interface will be implemented here
                  </p>
                </div>
              </div>
            )}

            {/* Bindings Tab */}
            {activeTab === 'bindings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-50">n8n Workflow Bindings</h3>
                  {agent.kind === 'n8n' && (
                    <button className="px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors">
                      Add Binding
                    </button>
                  )}
                </div>

                {agent.kind === 'n8n' ? (
                  <div className="space-y-4">
                    {bindings.length > 0 ? (
                      bindings.map((binding) => (
                        <div key={binding.id} className="border border-zinc-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-slate-50">Workflow {binding.workflow_id}</h4>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 bg-zinc-800 text-slate-50 text-sm rounded hover:bg-zinc-700 transition-colors">
                                Edit
                              </button>
                              <button className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">
                                Remove
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-400">Base URL: {binding.n8n_base_url}</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-zinc-400 mb-4">No workflow bindings configured</p>
                        <button className="px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors">
                          Configure First Binding
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-400">
                      This agent doesn't use n8n workflows. Bindings are only available for n8n-type agents.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Version Modal - Placeholder */}
      {showCreateVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Create New Version</h3>
            <p className="text-zinc-400 mb-6">
              This modal will contain the version creation form
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateVersion(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateVersion(false)}
                className="flex-1 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Create Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
