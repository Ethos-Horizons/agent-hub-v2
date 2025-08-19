'use client';

import { useState, useEffect } from 'react';
import { Plus, Globe, Webhook, Database, Settings, TestTube, Edit, Trash2 } from 'lucide-react';
import { Destination } from '@/features/destinations/types';
import { cn, formatDate } from '@/lib/utils';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState<string | null>(null);

  // Mock data - will be replaced with API calls
  useEffect(() => {
    setTimeout(() => {
      setDestinations([
        {
          id: '1',
          tenant_id: 'user1',
          name: 'Marketing CRM',
          kind: 'webhook',
          endpoint_url: 'https://api.marketing-crm.com/webhooks/agent-hub',
          headers: {
            'Authorization': 'Bearer ***',
            'Content-Type': 'application/json',
          },
          shared_secret: 'secret123',
          rate_limit: {
            requests_per_minute: 60,
            burst_size: 10,
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
        },
        {
          id: '2',
          tenant_id: 'user1',
          name: 'Analytics Dashboard',
          kind: 'supabase-func',
          endpoint_url: 'https://your-project.supabase.co/functions/v1/agent-hub',
          headers: {
            'Authorization': 'Bearer ***',
          },
          shared_secret: 'secret456',
          rate_limit: {
            requests_per_minute: 120,
            burst_size: 20,
          },
          created_at: '2024-01-10T14:30:00Z',
          updated_at: '2024-01-12T09:15:00Z',
        },
        {
          id: '3',
          tenant_id: 'user1',
          name: 'Custom API',
          kind: 'custom',
          endpoint_url: 'https://api.example.com/v1/agents',
          headers: {
            'X-API-Key': '***',
            'X-Signature': '***',
          },
          shared_secret: 'secret789',
          rate_limit: {
            requests_per_minute: 30,
            burst_size: 5,
          },
          created_at: '2024-01-05T16:45:00Z',
          updated_at: '2024-01-05T16:45:00Z',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getKindIcon = (kind: Destination['kind']) => {
    switch (kind) {
      case 'webhook':
        return <Webhook className="w-5 h-5 text-blue-500" />;
      case 'supabase-func':
        return <Database className="w-5 h-5 text-green-500" />;
      case 'custom':
        return <Globe className="w-5 h-5 text-purple-500" />;
      default:
        return <Settings className="w-5 h-5 text-zinc-500" />;
    }
  };

  const getKindColor = (kind: Destination['kind']) => {
    switch (kind) {
      case 'webhook':
        return 'bg-blue-500/10 text-blue-400 border-blue-400/20';
      case 'supabase-func':
        return 'bg-green-500/10 text-green-400 border-green-400/20';
      case 'custom':
        return 'bg-purple-500/10 text-purple-400 border-purple-400/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-400/20';
    }
  };

  const handleTestDestination = async (destinationId: string) => {
    setShowTestModal(destinationId);
    // Mock test - will be replaced with actual API call
    setTimeout(() => {
      setShowTestModal(null);
    }, 3000);
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
            <h1 className="text-4xl font-bold text-cyan-400">Task Destinations</h1>
            <p className="text-xl text-zinc-400 mt-2">
              Configure where your agents can send tasks and results
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Destination
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Total Destinations</p>
                <p className="text-2xl font-bold text-slate-50">{destinations.length}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-400/10 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Webhooks</p>
                <p className="text-2xl font-bold text-slate-50">
                  {destinations.filter(d => d.kind === 'webhook').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Webhook className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Supabase Functions</p>
                <p className="text-2xl font-bold text-slate-50">
                  {destinations.filter(d => d.kind === 'supabase-func').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-400">Custom APIs</p>
                <p className="text-2xl font-bold text-slate-50">
                  {destinations.filter(d => d.kind === 'custom').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-50">Your Destinations</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                Bulk Actions
              </button>
              <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                Export
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <div
                key={destination.id}
                className="bg-zinc-900/75 border border-zinc-800 rounded-lg p-6 hover:border-cyan-400/50 transition-colors group"
              >
                {/* Destination Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getKindIcon(destination.kind)}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-50 group-hover:text-cyan-400 transition-colors">
                        {destination.name}
                      </h3>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                        getKindColor(destination.kind)
                      )}>
                        {destination.kind}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Edit className="w-4 h-4 text-zinc-400" />
                    </button>
                    <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
                      <Trash2 className="w-4 h-4 text-zinc-400" />
                    </button>
                  </div>
                </div>

                {/* Destination Info */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Endpoint</label>
                    <p className="text-sm text-slate-50 font-mono bg-zinc-800 p-2 rounded truncate">
                      {destination.endpoint_url}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Rate Limit</label>
                    <p className="text-sm text-slate-50">
                      {destination.rate_limit?.requests_per_minute || 'Unlimited'} req/min
                      {destination.rate_limit?.burst_size && ` (burst: ${destination.rate_limit.burst_size})`}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Security</label>
                    <p className="text-sm text-slate-50">
                      {destination.shared_secret ? 'HMAC Verified' : 'No verification'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => handleTestDestination(destination.id)}
                    className="flex-1 px-4 py-2 bg-cyan-400 text-black font-medium rounded-lg hover:bg-cyan-300 transition-colors text-center text-sm flex items-center justify-center gap-2"
                  >
                    <TestTube className="w-4 h-4" />
                    Test
                  </button>
                  
                  <button className="px-4 py-2 bg-zinc-800 text-slate-50 rounded-lg hover:bg-zinc-700 transition-colors text-sm">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Configure
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {destinations.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Globe className="w-12 h-12 text-zinc-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-50 mb-2">No destinations configured</h3>
              <p className="text-zinc-400 mb-6">
                Create your first destination to start routing tasks to external applications
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-cyan-400 text-black font-semibold rounded-lg hover:bg-cyan-300 transition-colors"
              >
                Create Your First Destination
              </button>
            </div>
          )}
        </div>

        {/* Create Destination Modal - Placeholder */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Create New Destination</h3>
              <p className="text-zinc-400 mb-6">
                This modal will contain the destination creation form
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

        {/* Test Destination Modal - Placeholder */}
        {showTestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-50 mb-4">Testing Destination</h3>
              <p className="text-zinc-400 mb-6">
                Sending test payload to destination...
              </p>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
