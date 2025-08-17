import { AppLayout } from '@/components/layout/AppLayout'

interface RunsLayoutProps {
  children: React.ReactNode
}

export default function RunsLayout({ children }: RunsLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
