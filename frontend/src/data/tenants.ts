import type { Tenant } from '@/types'

export const tenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Müller GmbH',
    address: 'Bahnhofstrasse 42, 8001 Zürich',
    uid: 'CHE-123.456.789',
    plan: 'Professional',
  },
  {
    id: 'tenant-2',
    name: 'Schneider AG',
    address: 'Bundesplatz 10, 3011 Bern',
    uid: 'CHE-987.654.321',
    plan: 'Enterprise',
  },
  {
    id: 'tenant-3',
    name: 'Bäckerei Meier',
    address: 'Marktgasse 7, 4001 Basel',
    uid: 'CHE-456.789.123',
    plan: 'Starter',
  },
]
