'use client'
import { useState } from 'react'
import { 
  Settings,
  Save,
  Database,
  Key,
  Shield,
  Bell,
  User,
  Globe,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Zap
} from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Basic platform configuration and preferences',
    icon: Settings
  },
  {
    id: 'database',
    title: 'Database & Storage',
    description: 'Supabase connection and data management',
    icon: Database
  },
  {
    id: 'api-keys',
    title: 'API Keys',
    description: 'Manage external service integrations',
    icon: Key
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Authentication and access control',
    icon: Shield
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Alert preferences and delivery settings',
    icon: Bell
  }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('general')
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({})
  const [settings, setSettings] = useState({
    general: {
      organizationName: 'Ethos Digital',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en',
      defaultTenantId: 'tenant_123'
    },
    database: {
      supabaseUrl: 'https://your-project.supabase.co',
      connectionStatus: 'connected',
      lastBackup: '2024-01-15T10:30:00Z',
      storageUsed: '2.3 GB',
      storageLimit: '100 GB'
    },
    apiKeys: {
      openai: { 
        key: 'sk-proj-***************************',
        status: 'active',
        lastUsed: '2024-01-15T14:30:00Z',
        usage: '$12.45 this month'
      },
      langfuse: {
        key: 'lf_***************************',
        status: 'active', 
        lastUsed: '2024-01-15T14:25:00Z',
        usage: '1,247 traces this month'
      },
      n8n: {
        baseUrl: 'https://your-instance.app.n8n.cloud',
        status: 'connected',
        lastSync: '2024-01-15T14:30:45Z',
        webhookSecret: 'wh_***************************'
      }
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 8,
      allowedIPs: ['192.168.1.0/24'],
      auditLogging: true,
      encryptionEnabled: true
    },
    notifications: {
      emailAlerts: true,
      slackWebhook: '',
      errorThreshold: 5,
      performanceAlerts: true,
      weeklyReports: true
    }
  })

  const toggleSecret = (keyPath: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyPath]: !prev[keyPath]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSave = () => {
    // Simulate save
    console.log('Saving settings:', settings)
  }

  const generateNewKey = (service: string) => {
    console.log('Generating new key for:', service)
    // Implement key generation
  }

  const testConnection = (service: string) => {
    console.log('Testing connection for:', service)
    // Implement connection test
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Organization Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={settings.general.organizationName}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, organizationName: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Default Tenant ID
            </label>
            <input
              type="text"
              value={settings.general.defaultTenantId}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, defaultTenantId: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, timezone: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Currency
            </label>
            <select
              value={settings.general.currency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                general: { ...prev.general, currency: e.target.value }
              }))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDatabaseSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Supabase Connection</h3>
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-400/10">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Connected</div>
                <div className="text-xs text-zinc-400">{settings.database.supabaseUrl}</div>
              </div>
            </div>
            <button
              onClick={() => testConnection('supabase')}
              className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
            >
              Test Connection
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Storage Used:</span>
              <span className="text-white ml-2">{settings.database.storageUsed}</span>
            </div>
            <div>
              <span className="text-zinc-400">Storage Limit:</span>
              <span className="text-white ml-2">{settings.database.storageLimit}</span>
            </div>
            <div>
              <span className="text-zinc-400">Last Backup:</span>
              <span className="text-white ml-2">{new Date(settings.database.lastBackup).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderApiKeysSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.apiKeys).map(([service, config]) => (
        <div key={service} className="bg-zinc-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400/10">
                {service === 'n8n' ? <Zap className="h-5 w-5 text-cyan-400" /> : <Key className="h-5 w-5 text-cyan-400" />}
              </div>
              <div>
                <div className="text-sm font-medium text-white capitalize">{service}</div>
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${config.status === 'active' || config.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-xs text-zinc-400">{config.status}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => generateNewKey(service)}
                className="px-3 py-1 bg-zinc-700 text-white rounded text-sm hover:bg-zinc-600"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => testConnection(service)}
                className="px-3 py-1 bg-cyan-400 text-black rounded text-sm hover:bg-cyan-300"
              >
                Test
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {service === 'n8n' ? (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Base URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={(config as any).baseUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard((config as any).baseUrl)}
                    className="px-2 py-2 text-zinc-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">API Key</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecrets[service] ? "text" : "password"}
                    value={(config as any).key}
                    readOnly
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => toggleSecret(service)}
                    className="px-2 py-2 text-zinc-400 hover:text-white"
                  >
                    {showSecrets[service] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard((config as any).key)}
                    className="px-2 py-2 text-zinc-400 hover:text-white"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-zinc-400">Last Used:</span>
                <span className="text-white ml-1">{new Date((config as any).lastUsed || (config as any).lastSync).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-400">Usage:</span>
                <span className="text-white ml-1">{(config as any).usage || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Access Control</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Two-Factor Authentication</div>
              <div className="text-xs text-zinc-400">Add an extra layer of security to your account</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.twoFactorEnabled ? 'bg-cyan-400' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Audit Logging</div>
              <div className="text-xs text-zinc-400">Track all user actions and system events</div>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, auditLogging: !prev.security.auditLogging }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.auditLogging ? 'bg-cyan-400' : 'bg-zinc-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.security.auditLogging ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings()
      case 'database':
        return renderDatabaseSettings()
      case 'api-keys':
        return renderApiKeysSettings()
      case 'security':
        return renderSecuritySettings()
      case 'notifications':
        return <div className="text-zinc-400">Notification settings coming soon...</div>
      default:
        return <div className="text-zinc-400">Section not found</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-zinc-400">Configure your AgentHub platform preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 transition-colors font-medium"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900/75 rounded-lg border border-zinc-800 p-4">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-cyan-400/10 text-cyan-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <div>
                      <div className="text-sm font-medium">{section.title}</div>
                      <div className="text-xs opacity-75">{section.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-zinc-900/75 rounded-lg border border-zinc-800 p-6">
            {renderCurrentSection()}
          </div>
        </div>
      </div>
    </div>
  )
}
