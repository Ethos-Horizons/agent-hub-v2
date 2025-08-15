import { AppLayout } from '../../components/layout/AppLayout'

interface AgentsLayoutProps {
  children: React.ReactNode
}

export default function AgentsLayout({ children }: AgentsLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
