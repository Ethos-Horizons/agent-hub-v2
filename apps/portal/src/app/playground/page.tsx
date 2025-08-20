'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, Play, Settings, TestTube, GitBranch, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Agent } from '@/features/agents/types';
import { PlaygroundSession, PlaygroundExecution } from '@/features/playground/types';
import { playgroundService } from '@/features/playground/service';
import { cn } from '@/lib/utils';

export default function PlaygroundPage() {
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agent');
  
  const [sessions, setSessions] = useState<PlaygroundSession[]>([]);
  const [activeSession, setActiveSession] = useState<PlaygroundSession | null>(null);
  const [executions, setExecutions] = useState<PlaygroundExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sessionsData, executionsData] = await Promise.all([
        playgroundService.listSessions(),
        Promise.resolve([]) // TODO: Get executions from service
      ]);
      
      setSessions(sessionsData);
      setExecutions(executionsData);
      
      // Set active session if agent is specified
      if (agentId) {
        const session = sessionsData.find(s => s.metadata?.agentId === agentId);
        if (session) {
          setActiveSession(session);
        }
      }
    } catch (error) {
      console.error('Failed to load playground data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (sessionData: {
    name: string;
    description: string;
    agentId?: string;
    workflowId?: string;
  }) => {
    try {
      const session = await playgroundService.createSession({
        tenantId: 'user', // TODO: Get from auth
        userId: 'user', // TODO: Get from auth
        ...sessionData
      });
      
      setSessions(prev => [...prev, session]);
      setActiveSession(session);
      setShowCreateSession(false);
      
      // Create environment for the session
      await playgroundService.createEnvironment(session.id);
      
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleDestroySession = async (sessionId: string) => {
    try {
      await playgroundService.destroySession(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (activeSession?.id === sessionId) {
        setActiveSession(null);
      }
    } catch (error) {
      console.error('Failed to destroy session:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-500 bg-green-500/10';
      case 'running':
        return 'text-blue-500 bg-blue-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
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
            <h1 className="text-3xl font-bold text-white">AI Agent Playground</h1>
            <p className="text-gray-400 mt-2">
              Test and experiment with AI agents in isolated, safe environments
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateSession(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
            >
              <Play className="h-5 w-5" />
              New Session
            </button>
            <button
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors font-medium"
            >
              <TestTube className="h-5 w-5" />
              Test Panel
            </button>
          </div>
        </div>

        {/* Active Session */}
        {activeSession && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-lg border border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Active Session: {activeSession.name}</h2>
                  <p className="text-blue-300 text-sm">{activeSession.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSession(null)}
                    className="px-3 py-2 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Close Session
                  </button>
                  <button
                    onClick={() => handleDestroySession(activeSession.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
                  >
                    Destroy Session
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Agent</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activeSession.metadata?.agentId || 'None'}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Workflow</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activeSession.metadata?.workflowId || 'None'}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Mode</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activeSession.metadata?.mode || 'Unknown'}
                  </p>
                </div>
                <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm font-medium text-white">Environment</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {activeSession.metadata?.environment || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Your Playground Sessions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={cn(
                  "bg-gray-900 p-6 rounded-lg border transition-colors cursor-pointer",
                  activeSession?.id === session.id 
                    ? "border-cyan-400 bg-cyan-400/10" 
                    : "border-gray-800 hover:border-gray-700"
                )}
                onClick={() => setActiveSession(session)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-cyan-400" />
                    <div>
                      <h3 className="font-semibold text-white">{session.name}</h3>
                      <p className="text-sm text-cyan-400">Playground Session</p>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2 py-1 text-xs font-medium rounded-full",
                    getStatusColor(session.status)
                  )}>
                    {session.status}
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4">{session.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Created {new Date(session.createdAt).toLocaleDateString()}</span>
                  <span>Expires {new Date(session.expiresAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSession(session);
                    }}
                    className="flex-1 px-3 py-2 bg-cyan-400 text-black rounded text-sm hover:bg-cyan-300 transition-colors text-center"
                  >
                    Open Session
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDestroySession(session.id);
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
                  >
                    Destroy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {sessions.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No playground sessions yet</h3>
            <p className="text-gray-500 mb-6">
              Create a new session to start testing AI agents in isolated environments
            </p>
            <button
              onClick={() => setShowCreateSession(true)}
              className="px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
            >
              Create Your First Session
            </button>
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-semibold text-white mb-4">Create New Playground Session</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateSession({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  agentId: formData.get('agentId') as string || undefined,
                  workflowId: formData.get('workflowId') as string || undefined,
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Session Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                      placeholder="e.g., Lead Generation Test"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      name="description"
                      required
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                      placeholder="What will you be testing?"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Agent ID (Optional)</label>
                    <input
                      type="text"
                      name="agentId"
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                      placeholder="e.g., conversational-agent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Workflow ID (Optional)</label>
                    <input
                      type="text"
                      name="workflowId"
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-400 focus:outline-none"
                      placeholder="e.g., lead-gen-workflow"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateSession(false)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-3 py-2 bg-cyan-400 text-black rounded hover:bg-cyan-300 transition-colors"
                  >
                    Create Session
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Test Panel */}
        {showTestPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Test Panel</h3>
                <button
                  onClick={() => setShowTestPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="text-md font-medium text-white mb-2">Test Configuration</h4>
                  <p className="text-gray-400 text-sm">
                    Configure tests for your AI agents and workflows. This panel allows you to:
                  </p>
                  <ul className="text-gray-400 text-sm mt-2 space-y-1">
                    <li>• Create test scenarios with input data</li>
                    <li>• Define assertions to validate outputs</li>
                    <li>• Run tests in isolated environments</li>
                    <li>• Compare execution results</li>
                    <li>• Monitor performance and behavior changes</li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 p-4 rounded">
                  <h4 className="text-md font-medium text-white mb-2">Example Test</h4>
                  <div className="bg-gray-900 p-3 rounded text-sm font-mono text-gray-300">
                    <div>Input: {"{"}</div>
                    <div>  "name": "John Doe",</div>
                    <div>  "email": "john@example.com",</div>
                    <div>  "company": "Acme Corp"</div>
                    <div>{"}"}</div>
                    <div className="mt-2">Assertions:</div>
                    <div>• Lead score &gt; 50</div>
                    <div>• Response contains "appointment"</div>
                    <div>• Execution time &lt; 5000ms</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm mb-4">
                    Test panel functionality coming soon...
                  </p>
                  <button
                    onClick={() => setShowTestPanel(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Close Panel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
