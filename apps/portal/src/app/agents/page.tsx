import Link from 'next/link'

const agents = [
  { id: 'gbp_post', name: 'GBP Post', desc: 'Write & publish Google Business Profile posts', category: 'Content' },
  { id: 'listings_sync', name: 'Listings Sync', desc: 'Push NAP to business directories', category: 'Directory Management' },
  { id: 'review_request', name: 'Review Request', desc: 'Send SMS/email review requests', category: 'Reputation' },
  { id: 'weekly_report', name: 'Weekly Report', desc: 'GA/GBP/Ads performance digest', category: 'Analytics' }
]

export default function AgentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
          <p className="text-gray-600">Available automation agents for your business</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {agent.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{agent.desc}</p>
                </div>
                
                <div className="flex justify-end">
                  <Link
                    href={`/command?agent=${agent.id}`}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Try Agent →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="text-blue-500 text-xl">💡</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Need a custom agent?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Contact our team to build custom automation agents tailored to your specific business needs.
                </p>
              </div>
              <div className="mt-4">
                <div className="text-sm">
                  <a href="mailto:support@ethosdigital.com" className="font-medium text-blue-800 hover:text-blue-600">
                    Get in touch →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
