import type { Tenant } from '@/types'

export const tenants: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Schreinerei Hofer AG',
    address: 'Werkstrasse 12, 3600 Thun',
    uid: 'CHE-114.827.593',
    plan: 'Smart',
  },
  {
    id: 'tenant-2',
    name: 'Gastro Seeland GmbH',
    address: 'Seevorstadt 28, 2502 Biel/Bienne',
    uid: 'CHE-339.561.207',
    plan: 'Complete',
  },
  {
    id: 'tenant-3',
    name: 'Elektro Bühler & Söhne',
    address: 'Industriestrasse 5, 4600 Olten',
    uid: 'CHE-472.918.364',
    plan: 'Basis',
  },
]
