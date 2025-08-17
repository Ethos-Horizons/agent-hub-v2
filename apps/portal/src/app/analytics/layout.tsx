import { AppLayout } from '@/components/layout/AppLayout'

interface AnalyticsLayoutProps {
  children: React.ReactNode
}

export default function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
