'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  Play, 
  Users, 
  Settings, 
  Database,
  Zap,
  TrendingUp
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot, badge: '4' },
  { href: '/runs', label: 'Runs', icon: Play },
  { href: '/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/api-logs', label: 'API Logs', icon: Database },
  { href: '/n8n-sync', label: 'n8n Sync', icon: Zap },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <aside 
      className={`
        group flex h-screen flex-col bg-black border-r border-zinc-800 
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-64' : 'w-16'}
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo */}
      <div className={`
        flex items-center border-b border-zinc-800 transition-all duration-300
        ${isExpanded ? 'gap-3 px-6 py-4' : 'justify-center px-4 py-4'}
      `}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-400 text-black">
          <Bot className="h-5 w-5" />
        </div>
        <div className={`
          transition-all duration-300 overflow-hidden
          ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
        `}>
          <div className="text-lg font-semibold text-white whitespace-nowrap">AgentHub</div>
          <div className="text-xs text-zinc-400 whitespace-nowrap">v2.0</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`
        flex-1 space-y-1 py-4 transition-all duration-300
        ${isExpanded ? 'px-4' : 'px-2'}
      `}>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || 
            (pathname.startsWith(item.href) && item.href !== '/')
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                relative flex items-center rounded-lg text-sm font-medium 
                transition-all duration-300 group/item
                ${isExpanded ? 'gap-3 px-3 py-2' : 'justify-center px-2 py-2'}
                ${isActive 
                  ? 'bg-zinc-800 text-cyan-400' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-cyan-400'
                }
              `}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span className={`
                transition-all duration-300 overflow-hidden whitespace-nowrap
                ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
              `}>
                {item.label}
              </span>
              {item.badge && isExpanded && (
                <span className={`
                  flex h-5 w-5 items-center justify-center rounded-full 
                  bg-cyan-400 text-xs font-medium text-black
                  transition-all duration-300
                  ${isExpanded ? 'opacity-100' : 'opacity-0'}
                `}>
                  {item.badge}
                </span>
              )}
              
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="
                  absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded
                  opacity-0 group-hover/item:opacity-100 transition-opacity duration-200
                  pointer-events-none z-50 whitespace-nowrap
                ">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 bg-cyan-400 text-black px-1.5 py-0.5 rounded-full text-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className={`
        border-t border-zinc-800 transition-all duration-300
        ${isExpanded ? 'p-4' : 'p-2'}
      `}>
        <div className={`
          flex items-center rounded-lg bg-zinc-900 transition-all duration-300
          ${isExpanded ? 'gap-3 p-3' : 'justify-center p-2'}
        `}>
          <div className="flex h-2 w-2 items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
          </div>
          <div className={`
            transition-all duration-300 overflow-hidden
            ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
          `}>
            <div className="text-sm font-medium text-white whitespace-nowrap">All Systems</div>
            <div className="text-xs text-zinc-400 whitespace-nowrap">Operational</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
