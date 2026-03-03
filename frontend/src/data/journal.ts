import type { JournalEntry } from '@/types'

export const journalEntries: JournalEntry[] = [
  // doc-1: Swisscom Rechnung (Verbucht)
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
  // doc-2: Migros Quittung (Verbucht)
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
  // doc-7: Vitra Büromöbel (Verbucht)
  {
    id: 'journal-3',
    tenantId: 'tenant-2',
    documentId: 'doc-7',
    buchungsDatum: '2024-01-13',
    erfassungsDatum: '2024-01-13T08:00:00Z',
    belegnummer: 'BEL-2024-003',
    beschreibung: 'Vitra Büromöbel: Stühle und Schreibtische',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-7', kontoNummer: '1510', kontoBezeichnung: 'Büroeinrichtungen', soll: 11517.11, haben: 0, text: 'Büromöbel netto' },
      { id: 'jl-8', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 932.89, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-9', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 12450.00, text: 'Verbindlichkeit Vitra' },
    ],
  },
  // doc-8: CleanSwiss Reinigung (Verbucht)
  {
    id: 'journal-4',
    tenantId: 'tenant-2',
    documentId: 'doc-8',
    buchungsDatum: '2024-01-11',
    erfassungsDatum: '2024-01-11T10:00:00Z',
    belegnummer: 'BEL-2024-004',
    beschreibung: 'CleanSwiss Büroreinigung Dezember 2023',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-10', kontoNummer: '6000', kontoBezeichnung: 'Mietaufwand Räumlichkeiten', soll: 629.05, haben: 0, text: 'Reinigung netto' },
      { id: 'jl-11', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 50.95, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-12', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 680.00, text: 'Verbindlichkeit CleanSwiss' },
    ],
  },
  // doc-12: Coop Mehl (Verbucht)
  {
    id: 'journal-5',
    tenantId: 'tenant-3',
    documentId: 'doc-12',
    buchungsDatum: '2024-01-15',
    erfassungsDatum: '2024-01-15T09:00:00Z',
    belegnummer: 'BEL-2024-005',
    beschreibung: 'Coop Mehllieferung',
    status: 'Manuell bestaetigt',
    lines: [
      { id: 'jl-13', kontoNummer: '4000', kontoBezeichnung: 'Materialaufwand', soll: 373.77, haben: 0, text: 'Rohstoffe netto' },
      { id: 'jl-14', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 11.43, haben: 0, text: 'Vorsteuer 2.6%' },
      { id: 'jl-15', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 385.20, text: 'Verbindlichkeit Coop' },
    ],
  },
  // OCR-Vorschläge für In Prüfung Dokumente
  {
    id: 'journal-6',
    tenantId: 'tenant-1',
    documentId: 'doc-3',
    buchungsDatum: '2024-01-19',
    erfassungsDatum: '2024-01-19T09:00:00Z',
    belegnummer: 'BEL-2024-006',
    beschreibung: 'Microsoft 365 Business Standard',
    status: 'OCR-Vorschlag',
    lines: [
      { id: 'jl-16', kontoNummer: '6570', kontoBezeichnung: 'IT-Aufwand', soll: 244.22, haben: 0, text: 'Microsoft 365 netto' },
      { id: 'jl-17', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 19.78, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-18', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 264.00, text: 'Verbindlichkeit Microsoft' },
    ],
  },
  {
    id: 'journal-7',
    tenantId: 'tenant-1',
    documentId: 'doc-6',
    buchungsDatum: '2024-01-26',
    erfassungsDatum: '2024-01-26T09:00:00Z',
    belegnummer: 'BEL-2024-007',
    beschreibung: 'PostFinance Kontoführungsgebühren Q4',
    status: 'OCR-Vorschlag',
    lines: [
      { id: 'jl-19', kontoNummer: '4500', kontoBezeichnung: 'Verwaltungsaufwand', soll: 41.63, haben: 0, text: 'Bankgebühren netto' },
      { id: 'jl-20', kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: 3.37, haben: 0, text: 'Vorsteuer 8.1%' },
      { id: 'jl-21', kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: 45.00, text: 'Verbindlichkeit PostFinance' },
    ],
  },
]
