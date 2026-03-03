import type { JournalEntry } from '@/types'

export const journalEntries: JournalEntry[] = [
  // doc-1: Swisscom Rechnung (Verbucht) - Schreinerei Hofer AG
  {
    id: 'journal-1',
    tenantId: 'tenant-1',
    documentId: 'doc-1',
    buchungsDatum: '2024-01-17',
    erfassungsDatum: '2024-01-17T10:30:00Z',
    belegnummer: 'BEL-2024-001',
    beschreibung: 'Swisscom Mobile Abo Business L, Januar 2024',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-1', kontoNummer: '6600', kontoBezeichnung: 'Telefonaufwand', soll: 175.39, haben: 0, text: 'Swisscom Abo netto' },
      { id: 'jl-2', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 14.11, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-3', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 189.50, text: 'Verbindlichkeit Swisscom' },
    ],
  },
  // doc-2: Migros Quittung (Verbucht) - Schreinerei Hofer AG
  {
    id: 'journal-2',
    tenantId: 'tenant-1',
    documentId: 'doc-2',
    buchungsDatum: '2024-01-16',
    erfassungsDatum: '2024-01-16T14:15:00Z',
    belegnummer: 'BEL-2024-002',
    beschreibung: 'Migros Büromaterial und Verpflegung',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-4', kontoNummer: '6500', kontoBezeichnung: 'Büromaterial und Drucksachen', soll: 44.27, haben: 0, text: 'Büromaterial netto' },
      { id: 'jl-5', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 3.58, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-6', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 47.85, text: 'Verbindlichkeit Migros' },
    ],
  },
  // doc-6: Aligro Grosshandel (Verbucht) - Gastro Seeland GmbH
  {
    id: 'journal-3',
    tenantId: 'tenant-2',
    documentId: 'doc-6',
    buchungsDatum: '2024-01-13',
    erfassungsDatum: '2024-01-13T08:00:00Z',
    belegnummer: 'BEL-2024-003',
    beschreibung: 'Aligro Lebensmittel Grosseinkauf KW2',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-7', kontoNummer: '4000', kontoBezeichnung: 'Materialaufwand', soll: 3558.28, haben: 0, text: 'Lebensmittel netto' },
      { id: 'jl-8', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 289.22, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-9', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 3847.50, text: 'Verbindlichkeit Aligro' },
    ],
  },
  // doc-7: CleanSwiss Reinigung (Verbucht) - Gastro Seeland GmbH
  {
    id: 'journal-4',
    tenantId: 'tenant-2',
    documentId: 'doc-7',
    buchungsDatum: '2024-01-11',
    erfassungsDatum: '2024-01-11T10:00:00Z',
    belegnummer: 'BEL-2024-004',
    beschreibung: 'CleanSwiss Küchenreinigung Dezember 2023',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-10', kontoNummer: '6000', kontoBezeichnung: 'Mietaufwand Räumlichkeiten', soll: 629.05, haben: 0, text: 'Reinigung netto' },
      { id: 'jl-11', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 50.95, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-12', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 680.00, text: 'Verbindlichkeit CleanSwiss' },
    ],
  },
  // doc-10: Demelectric (Verbucht) - Elektro Bühler & Söhne
  {
    id: 'journal-5',
    tenantId: 'tenant-3',
    documentId: 'doc-10',
    buchungsDatum: '2024-01-15',
    erfassungsDatum: '2024-01-15T09:00:00Z',
    belegnummer: 'BEL-2024-005',
    beschreibung: 'Demelectric Elektromaterial Projekt Neubau',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-13', kontoNummer: '4000', kontoBezeichnung: 'Materialaufwand', soll: 1984.83, haben: 0, text: 'Elektromaterial netto' },
      { id: 'jl-14', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 160.77, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-15', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 2145.60, text: 'Verbindlichkeit Demelectric' },
    ],
  },
]
