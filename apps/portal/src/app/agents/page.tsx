'use client';

import { useState, useEffect } from 'react';
import { Plus, Bot, Settings, GitBranch, Sparkles } from 'lucide-react';
import { Agent } from '@/features/agents/types';
import { cn } from '@/lib/utils';

// TODO: Replace with AI-generated agents from natural language conversations
// This will be populated by the AI agent creation system
const mockAgents: Agent[] = [
  {
    id: 'conversational-agent',
    tenant_id: 'system',
    name: 'Conversational Agent',
    kind: 'local',
    slug: 'conversational-agent',
    description: 'Main website chat interface for lead generation and engagement',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'appointment-scheduler',
    tenant_id: 'system',
    name: 'Appointment Scheduler',
    kind: 'local',
    slug: 'appointment-scheduler',
    description: 'Google Calendar integration for consultation scheduling',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'research-agent',
    tenant_id: 'system',
    name: 'Research Agent',
    kind: 'local',
    slug: 'research-agent',
    description: 'Business intelligence gathering and market research',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'form-filling-agent',
    tenant_id: 'system',
    name: 'Form Filling Agent',
    kind: 'local',
    slug: 'form-filling-agent',
    description: 'Background Google Forms completion for lead qualification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch AI-generated agents
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAgents(mockAgents);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateAgent = async () => {
    // TODO: This will open the AI agent creation interface
    // Users will describe what they need in natural language
    // AI will research, plan, and implement the agent
    console.log('Opening AI agent creation interface...');
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Agent Registry</h1>
            <p className="text-gray-400 mt-2">
              AI-powered agents created through natural language conversations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
          >
            <Sparkles className="h-5 w-5" />
            Create Agent with AI
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">{agents.length}</p>
                <p className="text-gray-400">Active Agents</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {agents.filter(a => a.kind === 'local').length}
                </p>
                <p className="text-gray-400">AI-Generated</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <GitBranch className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {agents.filter(a => a.kind === 'local').length}
                </p>
                <p className="text-gray-400">Local Agents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agents Grid */}
        {agents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Your AI Agents</h2>
            <p className="text-gray-400 mb-4">
              These agents were created through natural language conversations with AI. 
              Each one can be tested, refined, and improved through the same conversational interface.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <div key={agent.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-white">{agent.name}</h3>
                        <p className="text-sm text-green-400">AI-Generated Agent</p>
                      </div>
                    </div>
                    <div className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Active
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>Created by AI</span>
                    <span>Ready to use</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-3 py-2 bg-cyan-400 text-black rounded text-sm hover:bg-cyan-300 transition-colors">
                      Test Agent
                    </button>
                    <button className="px-3 py-2 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition-colors">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {agents.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No agents yet</h3>
            <p className="text-gray-500 mb-6">
              Start creating agents by describing what you need in natural language
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
            >
              Create Your First Agent
            </button>
          </div>
        )}

        {/* AI Agent Creation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 p-6 rounded-lg max-w-2xl w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Create Agent with AI</h3>
              <p className="text-gray-400 mb-4">
                Describe what you need in natural language. Our AI will research, plan, and implement your agent.
              </p>
              <div className="mb-4">
                <textarea
                  placeholder="Describe the agent you need... (e.g., 'I need an agent that can schedule appointments and integrate with Google Calendar')"
                  className="w-full h-32 p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAgent}
                  className="flex-1 px-3 py-2 bg-cyan-400 text-black rounded hover:bg-cyan-300 transition-colors"
                >
                  Create with AI
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}