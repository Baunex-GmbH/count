import type { Konto } from '@/types'

// Simplified Swiss KMU Kontenrahmen (based on Schweizer Kontenrahmen KMU)
export const kontenrahmen: Konto[] = [
  // Aktiven (1xxx)
  { nummer: '1000', bezeichnung: 'Kasse', kategorie: 'Aktiven' },
  { nummer: '1020', bezeichnung: 'Bankguthaben', kategorie: 'Aktiven' },
  { nummer: '1100', bezeichnung: 'Forderungen aus Lieferungen und Leistungen', kategorie: 'Aktiven' },
  { nummer: '1170', bezeichnung: 'Vorsteuer (MwSt)', kategorie: 'Aktiven' },
  { nummer: '1200', bezeichnung: 'Vorräte Handelswaren', kategorie: 'Aktiven' },
  { nummer: '1500', bezeichnung: 'Maschinen und Apparate', kategorie: 'Aktiven' },
  { nummer: '1510', bezeichnung: 'Büroeinrichtungen', kategorie: 'Aktiven' },

  // Passiven (2xxx)
  { nummer: '2000', bezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', kategorie: 'Passiven' },
  { nummer: '2200', bezeichnung: 'Geschuldete MwSt', kategorie: 'Passiven' },
  { nummer: '2800', bezeichnung: 'Eigenkapital', kategorie: 'Passiven' },

  // Aufwand (3xxx-6xxx)
  { nummer: '3000', bezeichnung: 'Handelswarenaufwand', kategorie: 'Aufwand' },
  { nummer: '4000', bezeichnung: 'Materialaufwand', kategorie: 'Aufwand' },
  { nummer: '4200', bezeichnung: 'Miete', kategorie: 'Aufwand' },
  { nummer: '4300', bezeichnung: 'Versicherungsaufwand', kategorie: 'Aufwand' },
  { nummer: '4400', bezeichnung: 'Energieaufwand', kategorie: 'Aufwand' },
  { nummer: '4500', bezeichnung: 'Verwaltungsaufwand', kategorie: 'Aufwand' },
  { nummer: '4600', bezeichnung: 'Werbeaufwand', kategorie: 'Aufwand' },
  { nummer: '5000', bezeichnung: 'Löhne', kategorie: 'Aufwand' },
  { nummer: '5700', bezeichnung: 'Sozialversicherungsaufwand', kategorie: 'Aufwand' },
  { nummer: '6000', bezeichnung: 'Mietaufwand Räumlichkeiten', kategorie: 'Aufwand' },
  { nummer: '6500', bezeichnung: 'Büromaterial und Drucksachen', kategorie: 'Aufwand' },
  { nummer: '6570', bezeichnung: 'IT-Aufwand', kategorie: 'Aufwand' },
  { nummer: '6600', bezeichnung: 'Telefonaufwand', kategorie: 'Aufwand' },

  // Ertrag (7xxx-8xxx)
  { nummer: '7000', bezeichnung: 'Handelserlös', kategorie: 'Ertrag' },
  { nummer: '7010', bezeichnung: 'Dienstleistungserlös', kategorie: 'Ertrag' },
  { nummer: '8000', bezeichnung: 'Ausserordentlicher Ertrag', kategorie: 'Ertrag' },
]
