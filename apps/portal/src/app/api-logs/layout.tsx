import { AppLayout } from '@/components/layout/AppLayout'

interface ApiLogsLayoutProps {
  children: React.ReactNode
}

export default function ApiLogsLayout({ children }: ApiLogsLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
