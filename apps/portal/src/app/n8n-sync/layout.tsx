import { AppLayout } from '@/components/layout/AppLayout'

interface N8nSyncLayoutProps {
  children: React.ReactNode
}

export default function N8nSyncLayout({ children }: N8nSyncLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
