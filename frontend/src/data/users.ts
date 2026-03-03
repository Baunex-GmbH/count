import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'user-1',
    email: 'lisa.weber@example.ch',
    name: 'Lisa Weber',
    role: 'Hauptbuchhalter',
    tenantIds: ['tenant-1', 'tenant-2', 'tenant-3'],
    avatarInitials: 'LW',
  },
  {
    id: 'user-2',
    email: 'marco.brunner@example.ch',
    name: 'Marco Brunner',
    role: 'Buchhalter',
    tenantIds: ['tenant-1', 'tenant-2'],
    avatarInitials: 'MB',
  },
  {
    id: 'user-3',
    email: 'sarah.keller@example.ch',
    name: 'Sarah Keller',
    role: 'Buchhalter',
    tenantIds: ['tenant-3'],
    avatarInitials: 'SK',
  },
  {
    id: 'user-4',
    email: 'anna.mueller@example.ch',
    name: 'Anna Müller',
    role: 'User',
    tenantIds: ['tenant-1'],
    avatarInitials: 'AM',
  },
  {
    id: 'user-5',
    email: 'peter.schneider@example.ch',
    name: 'Peter Schneider',
    role: 'User',
    tenantIds: ['tenant-2'],
    avatarInitials: 'PS',
  },
  {
    id: 'user-6',
    email: 'hans.meier@example.ch',
    name: 'Hans Meier',
    role: 'User',
    tenantIds: ['tenant-3'],
    avatarInitials: 'HM',
  },
]
