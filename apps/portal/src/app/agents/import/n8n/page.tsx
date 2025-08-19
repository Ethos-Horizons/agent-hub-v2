'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Workflow, Settings, TestTube, Save } from 'lucide-react';
import Link from 'next/link';
import { N8nImportRequest, N8nWorkflowSummary, N8nBinding } from '@/features/n8n/types';
import { cn } from '@/lib/utils';

export default function N8nImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<'connect' | 'discover' | 'configure' | 'test' | 'save'>('connect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [connection, setConnection] = useState({
    n8n_base_url: '',
    auth_kind: 'apiKey' as const,
    api_key: '',
    username: '',
    password: '',
    oauth_token: '',
  });
  
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflowSummary | null>(null);
  const [workflows, setWorkflows] = useState<N8nWorkflowSummary[]>([]);
  const [binding, setBinding] = useState<N8nBinding | null>(null);
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleConnect = async () => {
    if (!connection.n8n_base_url) {
      setError('Please enter the n8n base URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock API call - will be replaced with actual n8n API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate workflow discovery
      setWorkflows([
        {
          id: 'workflow-1',
          name: 'Email Marketing Automation',
          active: true,
          nodes: [],
          connections: {},
          settings: {},
          tags: ['email', 'marketing'],
          versionId: 'v1',
          node_count: 8,
          webhook_nodes: [],
          rest_nodes: [],
          estimated_input_schema: {
            email: 'string',
            name: 'string',
            campaign: 'string',
          },
          estimated_output_schema: {
            success: 'boolean',
            message_id: 'string',
          },
        },
        {
          id: 'workflow-2',
          name: 'Lead Qualification',
          active: true,
          nodes: [],
          connections: {},
          settings: {},
          tags: ['leads', 'qualification'],
          versionId: 'v1',
          node_count: 12,
          webhook_nodes: [],
          rest_nodes: [],
          estimated_input_schema: {
            lead_data: 'object',
            source: 'string',
          },
          estimated_output_schema: {
            qualified: 'boolean',
            score: 'number',
            next_steps: 'array',
          },
        },
      ]);
      
      setStep('discover');
    } catch (err) {
      setError('Failed to connect to n8n. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowSelect = (workflow: N8nWorkflowSummary) => {
    setSelectedWorkflow(workflow);
    setBinding({
      workflow_id: workflow.id,
      base_url: connection.n8n_base_url,
      auth_credentials: {
        kind: connection.auth_kind,
        api_key: connection.api_key,
        username: connection.username,
        password: connection.password,
        oauth_token: connection.oauth_token,
      },
      input_mapping: {},
      output_mapping: {},
    });
    setStep('configure');
  };

  const handleTest = async () => {
    if (!binding || !testInput) return;

    setLoading(true);
    try {
      // Mock test execution
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setTestResult({
        success: true,
        output: {
          message: 'Test execution successful',
          data: JSON.parse(testInput),
          timestamp: new Date().toISOString(),
        },
        execution_time_ms: 1250,
      });
      
      setStep('save');
    } catch (err) {
      setTestResult({
        success: false,
        error: 'Test execution failed',
        execution_time_ms: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWorkflow || !binding) return;

    setLoading(true);
    try {
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the new agent
      router.push('/agents');
    } catch (err) {
      setError('Failed to save agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderConnectStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Connect to n8n</h3>
        <p className="text-zinc-400">
          Enter your n8n instance details to discover available workflows
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            n8n Base URL
          </label>
          <input
            type="url"
            value={connection.n8n_base_url}
            onChange={(e) => setConnection(prev => ({ ...prev, n8n_base_url: e.target.value }))}
            placeholder="https://your-n8n-instance.com"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Authentication Method
          </label>
          <select
            value={connection.auth_kind}
            onChange={(e) => setConnection(prev => ({ ...prev, auth_kind: e.target.value as any }))}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            <option value="apiKey">API Key</option>
            <option value="basic">Username/Password</option>
            <option value="oauth">OAuth Token</option>
          </select>
        </div>

        {connection.auth_kind === 'apiKey' && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={connection.api_key}
              onChange={(e) => setConnection(prev => ({ ...prev, api_key: e.target.value }))}
              placeholder="Enter your n8n API key"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        )}

        {connection.auth_kind === 'basic' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Username
              </label>
              <input
                type="text"
                value={connection.username}
                onChange={(e) => setConnection(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Username"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={connection.password}
                onChange={(e) => setConnection(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {connection.auth_kind === 'oauth' && (
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              OAuth Token
            </label>
            <input
              type="password"
              value={connection.oauth_token}
              onChange={(e) => setConnection(prev => ({ ...prev, oauth_token: e.target.value }))}
              placeholder="Enter your OAuth token"
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            />
          </div>
        )}
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Discover Workflows
          </>
        )}
      </button>
    </div>
  );

  const renderDiscoverStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Available Workflows</h3>
        <p className="text-zinc-400">
          Select a workflow to import as an agent
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            onClick={() => handleWorkflowSelect(workflow)}
            className="border border-zinc-800 rounded-lg p-4 hover:border-cyan-400/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Workflow className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-medium text-slate-50 group-hover:text-cyan-400 transition-colors">
                    {workflow.name}
                  </h4>
                  <p className="text-sm text-zinc-400">{workflow.node_count} nodes</p>
                </div>
              </div>
              <div className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                workflow.active 
                  ? 'bg-green-500/10 text-green-400' 
                  : 'bg-yellow-500/10 text-yellow-400'
              )}>
                {workflow.active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs text-zinc-500">Input Schema:</span>
                <pre className="text-xs text-slate-50 bg-zinc-800 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(workflow.estimated_input_schema, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Output Schema:</span>
                <pre className="text-xs text-slate-50 bg-zinc-800 p-2 rounded mt-1 overflow-x-auto">
                  {JSON.stringify(workflow.estimated_output_schema, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Configure Agent</h3>
        <p className="text-zinc-400">
          Set up the agent details and workflow binding
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Agent Name
          </label>
          <input
            type="text"
            placeholder="e.g., Email Marketing Agent"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Description
          </label>
          <textarea
            placeholder="Describe what this agent does..."
            rows={3}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            System Prompt
          </label>
          <textarea
            placeholder="Enter the system prompt for this agent..."
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('discover')}
          className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('test')}
          className="px-6 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          Test Configuration
        </button>
      </div>
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Test Configuration</h3>
        <p className="text-zinc-400">
          Test your agent configuration with sample input
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            Test Input (JSON)
          </label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder='{"email": "test@example.com", "name": "Test User", "campaign": "welcome"}'
            rows={4}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-slate-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none font-mono"
          />
        </div>

        {testResult && (
          <div className="border border-zinc-800 rounded-lg p-4">
            <h4 className="font-medium text-slate-50 mb-2">Test Result</h4>
            <div className={cn(
              'flex items-center gap-2 mb-2',
              testResult.success ? 'text-green-400' : 'text-red-400'
            )}>
              {testResult.success ? (
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              ) : (
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              )}
              <span className="text-sm font-medium">
                {testResult.success ? 'Success' : 'Failed'}
              </span>
              {testResult.execution_time_ms > 0 && (
                <span className="text-xs text-zinc-400">
                  ({testResult.execution_time_ms}ms)
                </span>
              )}
            </div>
            
            {testResult.output && (
              <pre className="text-sm text-slate-50 bg-zinc-800 p-3 rounded overflow-x-auto">
                {JSON.stringify(testResult.output, null, 2)}
              </pre>
            )}
            
            {testResult.error && (
              <p className="text-sm text-red-400">{testResult.error}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('configure')}
          className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleTest}
          disabled={loading || !testInput}
          className="px-6 py-2 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Testing...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4" />
              Run Test
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSaveStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full mx-auto mb-4 flex items-center justify-center">
          <div className="w-8 h-8 bg-green-500 rounded-full"></div>
        </div>
        <h3 className="text-lg font-semibold text-slate-50 mb-2">Configuration Tested Successfully!</h3>
        <p className="text-zinc-400">
          Your agent is ready to be created. Review the configuration and save.
        </p>
      </div>

      <div className="bg-zinc-800 rounded-lg p-4">
        <h4 className="font-medium text-slate-50 mb-2">Agent Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Type:</span>
            <span className="text-slate-50">n8n Workflow</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Workflow:</span>
            <span className="text-slate-50">{selectedWorkflow?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Base URL:</span>
            <span className="text-slate-50">{connection.n8n_base_url}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Test Status:</span>
            <span className="text-green-400">✓ Passed</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('test')}
          className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          Back to Test
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              Creating Agent...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Create Agent
            </>
          )}
        </button>
      </div>
    </div>
  );

  const steps = [
    { id: 'connect', label: 'Connect', icon: <Search className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover', icon: <Workflow className="w-4 h-4" /> },
    { id: 'configure', label: 'Configure', icon: <Settings className="w-4 h-4" /> },
    { id: 'test', label: 'Test', icon: <TestTube className="w-4 h-4" /> },
    { id: 'save', label: 'Save', icon: <Save className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/agents"
            className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">Import n8n Workflow</h1>
            <p className="text-xl text-zinc-400 mt-2">
              Convert your n8n workflows into Agent Hub agents
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-8">
            {steps.map((stepItem, index) => (
              <div key={stepItem.id} className="flex items-center">
                <div className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                  step === stepItem.id
                    ? 'border-cyan-400 bg-cyan-400 text-black'
                    : step === stepItem.id || steps.findIndex(s => s.id === step) > index
                    ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                )}>
                  {stepItem.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    'w-16 h-0.5 mx-4 transition-colors',
                    step === stepItem.id || steps.findIndex(s => s.id === step) > index
                      ? 'bg-cyan-400'
                      : 'bg-zinc-700'
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 'connect' && renderConnectStep()}
          {step === 'discover' && renderDiscoverStep()}
          {step === 'configure' && renderConfigureStep()}
          {step === 'test' && renderTestStep()}
          {step === 'save' && renderSaveStep()}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
