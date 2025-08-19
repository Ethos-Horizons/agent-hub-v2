'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Edit, Copy, GitBranch, Play, Settings } from 'lucide-react';
import { Agent, AgentVersion } from '@/features/agents/types';
import { cn, generateSlug, formatDate } from '@/lib/utils';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data for now - will be replaced with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAgents([
        {
          id: '1',
          tenant_id: 'user1',
          name: 'Content Generator',
          kind: 'local',
          slug: 'content-generator',
          description: 'Generates blog posts and social media content',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          tenant_id: 'user1',
          name: 'Email Automation',
          kind: 'n8n',
          slug: 'email-automation',
          description: 'Automates email workflows via n8n',
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusBadge = (agent: Agent) => {
    // Mock status - will come from active version
    const isActive = agent.kind === 'n8n' ? true : false;
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      )}>
        {isActive ? 'Active' : 'Draft'}
      </span>
    );
  };

  const getKindIcon = (kind: Agent['kind']) => {
    return kind === 'n8n' ? (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">n8n</span>
      </div>
    ) : (
      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">AI</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-800 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-zinc-800 rounded-lg"></div>
              ))}
            </div>
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
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Agent Registry</h1>
            <p className="text-xl text-zinc-400 mt-2">
              Manage your AI agents and n8n workflows
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Agent
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Agents</p>
                <p className="text-2xl font-bold text-slate-50">{agents.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Local Agents</p>
                <p className="text-2xl font-bold text-slate-50">
                  {agents.filter(a => a.kind === 'local').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">n8n Workflows</p>
                <p className="text-2xl font-bold text-slate-50">
                  {agents.filter(a => a.kind === 'n8n').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Active Versions</p>
                <p className="text-2xl font-bold text-slate-50">
                  {agents.filter(a => a.kind === 'n8n').length + 1}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-50">Your Agents</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                Import n8n
              </button>
              <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                Bulk Actions
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors group"
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  {getKindIcon(agent.kind)}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Edit className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Copy className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {/* Agent Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-50 group-hover:text-cyan-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{agent.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(agent)}
                    <span className="text-xs text-zinc-500">
                      {formatDate(agent.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-2">
                  <Link
                    href={`/agents/${agent.slug}`}
                    className="flex-1 px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors text-center text-sm"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Edit
                  </Link>
                  
                  <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                    <Play className="w-4 h-4 inline mr-2" />
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {agents.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Settings className="w-12 h-12 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">No agents yet</h3>
              <p className="text-zinc-400 mb-6">
                Create your first agent to get started with automation
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Create Your First Agent
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Agent Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Create New Agent</h3>
            <p className="text-zinc-400 mb-6">
              This modal will contain the agent creation form
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}