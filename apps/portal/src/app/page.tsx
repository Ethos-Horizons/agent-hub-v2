import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to AgentHub
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Centralized platform for managing AI-powered business automation agents
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/agents"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              View Agents
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center space-y-2">
            <div className="text-2xl">🤖</div>
            <h3 className="text-lg font-semibold">Agent Management</h3>
            <p className="text-gray-600 text-sm">
              Manage and execute AI automation agents for your business
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl">⚡</div>
            <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
            <p className="text-gray-600 text-sm">
              Track execution status and performance in real-time
            </p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-2xl">🔗</div>
            <h3 className="text-lg font-semibold">n8n Integration</h3>
            <p className="text-gray-600 text-sm">
              Seamless integration with n8n workflow automation
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
