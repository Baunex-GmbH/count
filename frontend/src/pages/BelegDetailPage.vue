<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { useJournalStore } from '@/stores/journal'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useAuditLog } from '@/composables/useAuditLog'
import StatusBadge from '@/components/StatusBadge.vue'
import type { Konto, MwstSatz } from '@/types'

const route = useRoute()
const router = useRouter()
const docs = useDocumentStore()
const journal = useJournalStore()
const auth = useAuthStore()
const notifications = useNotificationStore()
const auditExpanded = ref(false)
const kontenrahmen = ref<Konto[]>([])
const previewFailed = ref(false)

onMounted(async () => {
  kontenrahmen.value = await journal.getKontenrahmen()
  // Fetch journal for this tenant if needed
  if (document.value) {
    await journal.fetchJournal(document.value.tenantId)
  }
})

const docId = computed(() => route.params.id as string)
const document = computed(() => docs.getById(docId.value))
const journalEntry = computed(() => journal.getByDocumentId(docId.value))
const { auditEntries, formatTimestamp } = useAuditLog(() => document.value)

const isBuchhalter = computed(() => {
  const role = auth.currentUser?.role
  return role === 'Buchhalter' || role === 'Hauptbuchhalter'
})

const canEdit = computed(() => isBuchhalter.value && document.value?.status === 'In Pruefung')

// Booking form
const mwstOptions: MwstSatz[] = [8.1, 2.6, 3.8, 0]

const form = reactive({
  lieferant: '',
  beschreibung: '',
  datum: new Date().toISOString().split('T')[0],
  brutto: null as number | null,
  mwstSatz: 8.1 as MwstSatz,
  sollKonto: '' as string,
})

const berechneteWerte = computed(() => {
  if (!form.brutto || form.brutto <= 0) return { netto: 0, mwst: 0 }
  const mwst = form.mwstSatz > 0 ? Math.round((form.brutto / (1 + form.mwstSatz / 100)) * (form.mwstSatz / 100) * 100) / 100 : 0
  const netto = Math.round((form.brutto - mwst) * 100) / 100
  return { netto, mwst }
})

const selectedKonto = computed((): Konto | undefined => {
  return kontenrahmen.value.find(k => k.nummer === form.sollKonto)
})

const formValid = computed(() => {
  return form.lieferant.trim() && form.brutto && form.brutto > 0 && form.sollKonto && form.datum
})

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function verbuchen() {
  if (!formValid.value || !document.value) return

  const brutto = form.brutto!
  const { netto, mwst } = berechneteWerte.value
  const konto = selectedKonto.value!

  // Update document OCR data
  await docs.updateOcrResult(docId.value, {
    betrag: brutto,
    netto,
    mwst,
    mwstSatz: form.mwstSatz,
    datum: form.datum,
    lieferant: form.lieferant,
    belegTyp: 'Rechnung',
    beschreibung: form.beschreibung,
    confidence: 100,
    waehrung: 'CHF',
  })

  // Create journal entry
  const lines = [
    { kontoNummer: konto.nummer, kontoBezeichnung: konto.bezeichnung, soll: netto, haben: 0, text: `${form.lieferant} netto` },
  ]
  if (mwst > 0) {
    lines.push({ kontoNummer: '1170', kontoBezeichnung: 'Vorsteuer (MwSt)', soll: mwst, haben: 0, text: `Vorsteuer ${form.mwstSatz}%` })
  }
  lines.push({ kontoNummer: '2000', kontoBezeichnung: 'Kreditoren (Verbindlichkeiten L+L)', soll: 0, haben: brutto, text: `Verbindlichkeit ${form.lieferant}` })

  const entry = await journal.createEntryForDocument(docId.value, document.value.tenantId, form.beschreibung || form.lieferant, lines)
  if (entry) journal.confirmEntry(entry.id)

  await docs.setStatus(docId.value, 'Verbucht')
  notifications.success('Verbucht', `Beleg "${document.value.dateiname}" wurde verbucht`)
}
</script>

<template>
  <div v-if="!document" class="not-found">
    <p>Beleg nicht gefunden.</p>
    <button class="btn btn--secondary" @click="router.push('/belege')">Zurück zu Belege</button>
  </div>

  <div v-else class="detail">
    <div class="detail__toolbar">
      <button class="btn btn--ghost" @click="router.push('/belege')">
        <i class="pi pi-arrow-left"></i> Zurück
      </button>
      <div class="detail__toolbar-right">
        <a v-if="document.vorschauUrl" :href="document.vorschauUrl" :download="document.dateiname" class="btn btn--outline">
          <i class="pi pi-download"></i> Download
        </a>
        <StatusBadge :status="document.status" />
      </div>
    </div>

    <h1 class="detail__title">{{ document.dateiname }}</h1>

    <div class="detail__split">
      <!-- Left: Preview -->
      <div class="detail__preview">
        <div class="preview-panel">
          <div v-if="document.vorschauUrl && !previewFailed && document.dateityp === 'pdf'" class="preview-panel__pdf">
            <iframe :src="document.vorschauUrl" type="application/pdf" @error="previewFailed = true"></iframe>
          </div>
          <div v-else-if="document.vorschauUrl && !previewFailed && document.dateityp !== 'pdf'" class="preview-panel__image">
            <img :src="document.vorschauUrl" alt="Vorschau" @error="previewFailed = true" />
          </div>
          <div v-else class="preview-panel__placeholder">
            <i :class="document.dateityp === 'pdf' ? 'pi pi-file-pdf' : 'pi pi-image'"></i>
            <span>{{ document.dateityp.toUpperCase() }}-Vorschau</span>
            <span class="preview-panel__hint">In der Produktionsversion wird hier das Dokument angezeigt</span>
          </div>
        </div>
      </div>

      <!-- Right: Data -->
      <div class="detail__data">

        <!-- Buchungsformular (nur Buchhalter, nur In Prüfung) -->
        <div v-if="canEdit" class="card">
          <div class="card__header">
            <h3><i class="pi pi-pencil"></i> Buchung erfassen</h3>
          </div>
          <div class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Lieferant *</label>
                <input v-model="form.lieferant" type="text" class="form-input" placeholder="z.B. Swisscom AG" />
              </div>
              <div class="form-group">
                <label class="form-label">Belegdatum *</label>
                <input v-model="form.datum" type="date" class="form-input" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Beschreibung</label>
              <input v-model="form.beschreibung" type="text" class="form-input" placeholder="z.B. Mobile Abo Januar 2024" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Betrag brutto (CHF) *</label>
                <input v-model.number="form.brutto" type="number" step="0.05" min="0" class="form-input" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label class="form-label">MwSt-Satz</label>
                <select v-model.number="form.mwstSatz" class="form-input">
                  <option v-for="satz in mwstOptions" :key="satz" :value="satz">
                    {{ satz > 0 ? satz + '%' : 'Keine MwSt (0%)' }}
                  </option>
                </select>
              </div>
            </div>

            <div v-if="form.brutto && form.brutto > 0" class="calc-preview">
              <span>Netto: {{ formatCHF(berechneteWerte.netto) }}</span>
              <span v-if="berechneteWerte.mwst > 0">MwSt: {{ formatCHF(berechneteWerte.mwst) }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Aufwandkonto (Soll) *</label>
              <select v-model="form.sollKonto" class="form-input">
                <option value="" disabled>Konto wählen...</option>
                <optgroup v-for="kat in ['Aufwand', 'Aktiven']" :key="kat" :label="kat">
                  <option v-for="k in kontenrahmen.filter((k: Konto) => k.kategorie === kat)" :key="k.nummer" :value="k.nummer">
                    {{ k.nummer }} – {{ k.bezeichnung }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Buchungssatz Vorschau -->
            <div v-if="formValid" class="booking-preview">
              <div class="booking-preview__title">Buchungssatz</div>
              <table class="booking-preview__table">
                <thead>
                  <tr>
                    <th>Konto</th>
                    <th>Bezeichnung</th>
                    <th style="text-align:right">Soll</th>
                    <th style="text-align:right">Haben</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="konto">{{ form.sollKonto }}</td>
                    <td>{{ selectedKonto?.bezeichnung }}</td>
                    <td style="text-align:right;font-family:monospace">{{ formatCHF(berechneteWerte.netto) }}</td>
                    <td></td>
                  </tr>
                  <tr v-if="berechneteWerte.mwst > 0">
                    <td class="konto">1170</td>
                    <td>Vorsteuer (MwSt)</td>
                    <td style="text-align:right;font-family:monospace">{{ formatCHF(berechneteWerte.mwst) }}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td class="konto">2000</td>
                    <td>Kreditoren</td>
                    <td></td>
                    <td style="text-align:right;font-family:monospace">{{ formatCHF(form.brutto!) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button class="btn btn--success btn--full" @click="verbuchen" :disabled="!formValid">
              <i class="pi pi-check"></i> Verbuchen
            </button>
          </div>
        </div>

        <!-- Gebuchte Daten (Buchhalter sieht es nach Verbuchung, oder wenn schon gebucht) -->
        <div v-if="isBuchhalter && document.ocrResult && document.status === 'Verbucht'" class="card">
          <div class="card__header">
            <h3><i class="pi pi-check-circle"></i> Gebuchte Daten</h3>
          </div>
          <div class="ocr-fields">
            <div class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-building ocr-field__icon"></i> Lieferant</span>
              <span class="ocr-field__value">{{ document.ocrResult.lieferant }}</span>
            </div>
            <div class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-calendar ocr-field__icon"></i> Datum</span>
              <span class="ocr-field__value">{{ formatDate(document.ocrResult.datum) }}</span>
            </div>
            <div class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-wallet ocr-field__icon"></i> Betrag (brutto)</span>
              <span class="ocr-field__value">{{ formatCHF(document.ocrResult.betrag) }}</span>
            </div>
            <div class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-minus-circle ocr-field__icon"></i> Nettobetrag</span>
              <span class="ocr-field__value">{{ formatCHF(document.ocrResult.netto) }}</span>
            </div>
            <div class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-percentage ocr-field__icon"></i> MwSt</span>
              <span class="ocr-field__value">{{ formatCHF(document.ocrResult.mwst) }} ({{ document.ocrResult.mwstSatz }}%)</span>
            </div>
            <div v-if="document.ocrResult.beschreibung" class="ocr-field">
              <span class="ocr-field__label"><i class="pi pi-align-left ocr-field__icon"></i> Beschreibung</span>
              <span class="ocr-field__value">{{ document.ocrResult.beschreibung }}</span>
            </div>
          </div>
        </div>

        <!-- Journal Entry (nur Buchhalter) -->
        <div class="card" v-if="isBuchhalter && journalEntry">
          <div class="card__header">
            <h3><i class="pi pi-book"></i> Buchungssatz</h3>
            <span class="journal-status journal-status--confirmed">Bestätigt</span>
          </div>
          <table class="journal-table">
            <thead>
              <tr>
                <th>Konto</th>
                <th>Bezeichnung</th>
                <th style="text-align: right">Soll</th>
                <th style="text-align: right">Haben</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in journalEntry.lines" :key="line.id">
                <td class="journal-table__konto">{{ line.kontoNummer }}</td>
                <td>{{ line.kontoBezeichnung }}</td>
                <td style="text-align: right; font-family: monospace">{{ line.soll > 0 ? formatCHF(line.soll) : '' }}</td>
                <td style="text-align: right; font-family: monospace">{{ line.haben > 0 ? formatCHF(line.haben) : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Info for Mandant users -->
        <div v-if="!isBuchhalter && document.status === 'In Pruefung'" class="card">
          <div class="card__header">
            <h3><i class="pi pi-info-circle"></i> Status</h3>
          </div>
          <div class="info-message">
            Dieser Beleg wird von Ihrem Buchhalter geprüft und verbucht.
          </div>
        </div>

        <div v-if="!isBuchhalter && document.status === 'Verbucht'" class="card">
          <div class="card__header">
            <h3><i class="pi pi-check-circle"></i> Status</h3>
          </div>
          <div class="info-message info-message--success">
            Dieser Beleg wurde geprüft und verbucht.
          </div>
        </div>

        <!-- Audit Log -->
        <div class="card">
          <div class="card__header" style="cursor: pointer" @click="auditExpanded = !auditExpanded">
            <h3><i class="pi pi-history"></i> Verlauf</h3>
            <i :class="auditExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" style="color: #9ca3af"></i>
          </div>
          <div v-if="auditExpanded" class="audit-list">
            <div v-for="entry in auditEntries" :key="entry.id" class="audit-entry">
              <div class="audit-entry__dot"></div>
              <div class="audit-entry__content">
                <div class="audit-entry__header">
                  <span class="audit-entry__action">{{ entry.action }}</span>
                  <span class="audit-entry__time">{{ formatTimestamp(entry.timestamp) }}</span>
                </div>
                <span class="audit-entry__user">{{ entry.userName }}</span>
                <span class="audit-entry__detail">{{ entry.details }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.detail__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.detail__toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.detail__title {
  font-size: 1.3rem;
  color: #1f2937;
  margin: 0 0 1.25rem;
}

.detail__split {
  display: grid;
  grid-template-columns: 55% 45%;
  gap: 1.5rem;
}

@media (max-width: 960px) {
  .detail__split {
    grid-template-columns: 1fr;
  }
}

.preview-panel {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  position: sticky;
  top: 72px;
}

.preview-panel__image img {
  width: 100%;
  display: block;
}

.preview-panel__pdf iframe {
  width: 100%;
  height: 600px;
  border: none;
  display: block;
}

.preview-panel__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #9ca3af;
  background: #f9fafb;
  min-height: 400px;
}

.preview-panel__placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.4;
}

.preview-panel__hint {
  font-size: 0.78rem;
  margin-top: 0.5rem;
  color: #d1d5db;
}

.detail__data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.card__header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Booking form */
.booking-form {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
}

.form-input {
  padding: 0.5rem 0.65rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.88rem;
  color: #1f2937;
  background: white;
  outline: none;
  font-family: inherit;
}

.form-input:focus {
  border-color: #0B3D91;
  box-shadow: 0 0 0 3px rgba(11, 61, 145, 0.1);
}

.calc-preview {
  display: flex;
  gap: 1.25rem;
  font-size: 0.82rem;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.booking-preview {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.booking-preview__title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.5rem 0.75rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.booking-preview__table {
  width: 100%;
  border-collapse: collapse;
}

.booking-preview__table th {
  text-align: left;
  padding: 0.4rem 0.75rem;
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 500;
}

.booking-preview__table td {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  border-top: 1px solid #f3f4f6;
}

.booking-preview__table .konto {
  font-family: monospace;
  font-weight: 600;
  color: #0B3D91;
}

/* OCR / booked data fields */
.ocr-fields {
  padding: 0.5rem 1.25rem;
}

.ocr-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.55rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.ocr-field:last-child {
  border-bottom: none;
}

.ocr-field__label {
  font-size: 0.85rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ocr-field__icon {
  font-size: 0.8rem;
  color: #9ca3af;
}

.ocr-field__value {
  font-size: 0.88rem;
  font-weight: 500;
  color: #1f2937;
}

/* Info message for mandant users */
.info-message {
  padding: 1.25rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.info-message--success {
  color: #047857;
}

/* Journal table */
.journal-table {
  width: 100%;
  border-collapse: collapse;
}

.journal-table th {
  text-align: left;
  padding: 0.55rem 1.25rem;
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
}

.journal-table td {
  padding: 0.6rem 1.25rem;
  font-size: 0.88rem;
  border-top: 1px solid #f3f4f6;
}

.journal-table__konto {
  font-family: monospace;
  font-weight: 600;
  color: #0B3D91;
}

.journal-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.journal-status--confirmed {
  background: #d1fae5;
  color: #047857;
}

/* Audit log */
.audit-list {
  padding: 0.75rem 1.25rem;
}

.audit-entry {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.audit-entry:last-child {
  border-bottom: none;
}

.audit-entry__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0B3D91;
  flex-shrink: 0;
  margin-top: 0.35rem;
}

.audit-entry__content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.audit-entry__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.audit-entry__action {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.audit-entry__time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.audit-entry__user {
  font-size: 0.78rem;
  color: #6b7280;
}

.audit-entry__detail {
  font-size: 0.78rem;
  color: #9ca3af;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.15s;
}

.btn--ghost {
  background: none;
  color: #6b7280;
}

.btn--ghost:hover {
  color: #0B3D91;
}

.btn--success {
  background: #10b981;
  color: white;
}

.btn--success:hover {
  background: #059669;
}

.btn--success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--full {
  width: 100%;
  padding: 0.65rem;
  font-size: 0.95rem;
}

.btn--secondary {
  background: #f3f4f6;
  color: #4b5563;
}

.btn--outline {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
  text-decoration: none;
}

.btn--outline:hover {
  border-color: #0B3D91;
  color: #0B3D91;
}
</style>
