import type { User } from '@/types'

export const users: User[] = [
  {
    id: 'user-1',
    email: 'emre.oezbek@count.ch',
    name: 'Emre Özbek',
    role: 'Hauptbuchhalter',
    tenantIds: ['tenant-1', 'tenant-2', 'tenant-3'],
    avatarInitials: 'EÖ',
  },
  {
    id: 'user-2',
    email: 'sandra.hofer@treuhand-hofer.ch',
    name: 'Sandra Hofer',
    role: 'Buchhalter',
    tenantIds: ['tenant-1'],
    avatarInitials: 'SH',
  },
]
