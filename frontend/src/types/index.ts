// Count Q2 MVP - TypeScript Data Model

export type UserRole = 'Hauptbuchhalter' | 'Buchhalter' | 'User'

export type BelegStatus = 'In Pruefung' | 'Verbucht' | 'Archiviert'

export type BuchungsStatus = 'OCR-Vorschlag' | 'Manuell bestaetigt'

export type BelegTyp = 'Rechnung' | 'Quittung' | 'Gutschrift' | 'Lieferschein'

export type MwstSatz = 8.1 | 2.6 | 3.8 | 0

export interface Tenant {
  id: string
  name: string
  address: string
  uid: string // Swiss UID number
  plan: 'Starter' | 'Professional' | 'Enterprise'
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenantIds: string[]
  avatarInitials: string
}

export interface OcrResult {
  betrag: number
  netto: number
  mwst: number
  mwstSatz: MwstSatz
  datum: string // ISO date
  lieferant: string
  belegTyp: BelegTyp
  beschreibung: string
  confidence: number // 0-100
  waehrung: string
}

export interface AuditEntry {
  id: string
  documentId: string
  timestamp: string // ISO datetime
  userId: string
  userName: string
  action: string
  details: string
}

export interface Document {
  id: string
  tenantId: string
  dateiname: string
  dateityp: string // 'pdf' | 'jpg' | 'png'
  uploadDatum: string // ISO datetime
  uploadedBy: string // user id
  status: BelegStatus
  ocrResult: OcrResult | null
  vorschauUrl: string | null
  auditLog: AuditEntry[]
}

export interface Konto {
  nummer: string // e.g. "1000", "4000"
  bezeichnung: string
  kategorie: 'Aktiven' | 'Passiven' | 'Aufwand' | 'Ertrag'
}

export interface JournalLine {
  id: string
  kontoNummer: string
  kontoBezeichnung: string
  soll: number
  haben: number
  text: string
}

export interface JournalEntry {
  id: string
  tenantId: string
  documentId: string | null
  buchungsDatum: string // ISO date
  erfassungsDatum: string // ISO datetime
  belegnummer: string
  beschreibung: string
  status: BuchungsStatus
  lines: JournalLine[]
}

export interface Notification {
  id: string
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail: string
  life?: number
}

export interface PricingTier {
  name: string
  preis: number
  features: string[]
  highlighted: boolean
}
