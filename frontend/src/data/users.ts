import type { User } from '@/types'

export const users: User[] = [
  // Count-Team (Treuhand)
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
  // Mandanten
  {
    id: 'user-3',
    email: 'thomas.hofer@schreinerei-hofer.ch',
    name: 'Thomas Hofer',
    role: 'User',
    tenantIds: ['tenant-1'],
    avatarInitials: 'TH',
  },
  {
    id: 'user-4',
    email: 'patrizia.lang@gastro-seeland.ch',
    name: 'Patrizia Lang',
    role: 'User',
    tenantIds: ['tenant-2'],
    avatarInitials: 'PL',
  },
  {
    id: 'user-5',
    email: 'beat.buehler@elektro-buehler.ch',
    name: 'Beat Bühler',
    role: 'User',
    tenantIds: ['tenant-3'],
    avatarInitials: 'BB',
  },
]
