import type { OcrResult, MwstSatz, BelegTyp } from '@/types'

const swissVendors = [
  'Swisscom (Schweiz) AG',
  'Migros-Genossenschafts-Bund',
  'Coop Grosshandel',
  'SBB AG',
  'PostFinance AG',
  'Die Schweizerische Post',
  'Sunrise UPC GmbH',
  'Helvetia Versicherungen',
  'Zurich Insurance Group',
  'ABB Schweiz AG',
  'Nestlé Suisse S.A.',
  'Roche Diagnostics AG',
  'Schindler Aufzüge AG',
  'Emmi Schweiz AG',
  'Fleurop-Interflora (Schweiz) AG',
]

const beschreibungen: Record<BelegTyp, string[]> = {
  Rechnung: [
    'Monatsabonnement Geschäftskunden',
    'Dienstleistungen Q4 2023',
    'Lieferung Büromaterial',
    'Wartungsvertrag 2024',
    'IT-Support und Beratung',
    'Druckdienstleistungen',
  ],
  Quittung: [
    'Einkauf Verbrauchsmaterial',
    'Geschäftsessen mit Kunden',
    'Bürobedarf und Zubehör',
    'Tankbeleg Geschäftsfahrzeug',
  ],
  Gutschrift: [
    'Gutschrift für Retoure',
    'Rabatt auf Jahresabonnement',
    'Korrekturbuchung Dezember',
  ],
  Lieferschein: [
    'Warenlieferung gemäss Bestellung',
    'Teillieferung Projektmaterial',
  ],
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function useOcrSimulation() {
  function generateOcrResult(): OcrResult {
    const mwstSaetze: MwstSatz[] = [8.1, 2.6, 3.8, 0]
    const mwstSatz = randomChoice(mwstSaetze)
    const belegTyp = randomChoice<BelegTyp>(['Rechnung', 'Rechnung', 'Rechnung', 'Quittung', 'Gutschrift'])
    const netto = randomBetween(25, 5000)
    const mwst = mwstSatz > 0 ? Math.round(netto * (mwstSatz / 100) * 100) / 100 : 0
    const betrag = Math.round((netto + mwst) * 100) / 100

    const now = new Date()
    const daysAgo = Math.floor(Math.random() * 30)
    const datum = new Date(now.getTime() - daysAgo * 86400000).toISOString().split('T')[0]

    return {
      betrag: belegTyp === 'Gutschrift' ? -betrag : betrag,
      netto: belegTyp === 'Gutschrift' ? -netto : netto,
      mwst: belegTyp === 'Gutschrift' ? -mwst : mwst,
      mwstSatz,
      datum,
      lieferant: randomChoice(swissVendors),
      belegTyp,
      beschreibung: randomChoice(beschreibungen[belegTyp]),
      confidence: Math.floor(Math.random() * 25) + 75, // 75-99
      waehrung: 'CHF',
    }
  }

  function mutateOcrResult(original: OcrResult): OcrResult {
    const variation = 0.02 // 2% variation
    const nettoVariation = original.netto * (1 + (Math.random() - 0.5) * variation)
    const netto = Math.round(nettoVariation * 100) / 100
    const mwst = original.mwstSatz > 0 ? Math.round(netto * (original.mwstSatz / 100) * 100) / 100 : 0
    const betrag = Math.round((netto + mwst) * 100) / 100

    return {
      ...original,
      betrag: original.betrag < 0 ? -betrag : betrag,
      netto: original.netto < 0 ? -netto : netto,
      mwst: original.mwst < 0 ? -mwst : mwst,
      confidence: Math.min(99, original.confidence + Math.floor(Math.random() * 5) + 1),
    }
  }

  return { generateOcrResult, mutateOcrResult }
}
