import { AppLayout } from '@/components/layout/AppLayout'

interface SettingsLayoutProps {
  children: React.ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <AppLayout>{children}</AppLayout>
}
