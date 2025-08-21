'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  Globe,
  Sparkles,
  GitBranch,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agent Registry', icon: Bot },
  { href: '/agents/create', label: 'Create with AI', icon: Sparkles },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/runs', label: 'Agent Runs', icon: GitBranch },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/destinations', label: 'Destinations', icon: Globe },
  { href: '/api-logs', label: 'API Logs', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Show full sidebar when hovered or when manually expanded
  const isExpanded = !collapsed || isHovered;

  return (
    <div
      className={cn(
        'flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 relative group',
        isExpanded ? 'w-64' : 'w-16'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {isExpanded && (
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold text-white">Agent Hub</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-cyan-400 text-black font-medium'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-400 text-center">
            AI-Powered Agent Creation
          </div>
        </div>
      )}
    </div>
  );
}
