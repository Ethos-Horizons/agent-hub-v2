import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-red-500/10 rounded-full">
            <AlertTriangle className="h-16 w-16 text-red-400" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-white">Access Denied</h1>
          <div className="space-y-2">
            <p className="text-zinc-400">
              You don't have permission to access AgentHub.
            </p>
            <p className="text-sm text-zinc-500">
              This platform is restricted to authorized team members only.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="bg-zinc-900/75 rounded-lg border border-zinc-800 p-6 space-y-3">
            <h3 className="font-medium text-white">Need Access?</h3>
            <p className="text-sm text-zinc-400">
              Contact an administrator to request access to the AgentHub platform.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-600 pt-8">
          <p>© 2024 AgentHub. Secure agent orchestration platform.</p>
        </div>
      </div>
    </div>
  );
}
