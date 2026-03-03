<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { useJournalStore } from '@/stores/journal'
import { useAuditLog } from '@/composables/useAuditLog'
import StatusBadge from '@/components/StatusBadge.vue'
import ConfidenceBadge from '@/components/ConfidenceBadge.vue'

const route = useRoute()
const router = useRouter()
const docs = useDocumentStore()
const journal = useJournalStore()
const auditExpanded = ref(false)

const docId = computed(() => route.params.id as string)
const document = computed(() => docs.getById(docId.value))
const journalEntry = computed(() => journal.getByDocumentId(docId.value))
const { auditEntries, formatTimestamp } = useAuditLog(() => document.value)

const ocrFields = computed(() => {
  const ocr = document.value?.ocrResult
  if (!ocr) return []
  return [
    { label: 'Lieferant', value: ocr.lieferant, icon: 'pi-building' },
    { label: 'Belegtyp', value: ocr.belegTyp, icon: 'pi-tag' },
    { label: 'Datum', value: formatDate(ocr.datum), icon: 'pi-calendar' },
    { label: 'Betrag (brutto)', value: formatCHF(ocr.betrag), icon: 'pi-wallet' },
    { label: 'Nettobetrag', value: formatCHF(ocr.netto), icon: 'pi-minus-circle' },
    { label: 'MwSt', value: `${formatCHF(ocr.mwst)} (${ocr.mwstSatz}%)`, icon: 'pi-percentage' },
    { label: 'Beschreibung', value: ocr.beschreibung, icon: 'pi-align-left' },
    { label: 'Währung', value: ocr.waehrung, icon: 'pi-money-bill' },
  ]
})

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function rerunOcr() {
  docs.rerunOcr(docId.value)
}

function setInPruefung() {
  docs.setStatus(docId.value, 'In Pruefung')
}

function verbuchen() {
  docs.setStatus(docId.value, 'Verbucht')
  const entry = journal.getByDocumentId(docId.value)
  if (entry) {
    journal.confirmEntry(entry.id)
  }
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
        <StatusBadge :status="document.status" />
        <ConfidenceBadge v-if="document.ocrResult" :confidence="document.ocrResult.confidence" />
      </div>
    </div>

    <h1 class="detail__title">{{ document.dateiname }}</h1>

    <div class="detail__split">
      <!-- Left: Preview -->
      <div class="detail__preview">
        <div class="preview-panel">
          <div v-if="document.vorschauUrl && document.dateityp === 'pdf'" class="preview-panel__pdf">
            <iframe :src="document.vorschauUrl" type="application/pdf"></iframe>
          </div>
          <div v-else-if="document.vorschauUrl" class="preview-panel__image">
            <img :src="document.vorschauUrl" alt="Vorschau" />
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
        <!-- OCR Results -->
        <div class="card">
          <div class="card__header">
            <h3>
              <i class="pi pi-eye"></i> OCR-Ergebnis
              <span class="card__hint">vorgeschlagen</span>
            </h3>
            <button class="btn btn--outline btn--sm" @click="rerunOcr" :disabled="document.status === 'Verbucht'">
              <i class="pi pi-refresh"></i> OCR neu ausführen
            </button>
          </div>
          <div class="ocr-fields">
            <div v-for="field in ocrFields" :key="field.label" class="ocr-field">
              <span class="ocr-field__label">
                <i :class="'pi ' + field.icon" class="ocr-field__icon"></i>
                {{ field.label }}
              </span>
              <span class="ocr-field__value">{{ field.value }}</span>
            </div>
          </div>
        </div>

        <!-- Journal Entry -->
        <div class="card" v-if="journalEntry">
          <div class="card__header">
            <h3><i class="pi pi-book"></i> Buchungssatz</h3>
            <span class="journal-status" :class="journalEntry.status === 'Manuell bestaetigt' ? 'journal-status--confirmed' : 'journal-status--suggestion'">
              {{ journalEntry.status === 'Manuell bestaetigt' ? 'Bestätigt' : 'OCR-Vorschlag' }}
            </span>
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

        <!-- Actions -->
        <div class="actions-card" v-if="document.status !== 'Verbucht'">
          <h3>Aktionen</h3>
          <div class="actions-card__buttons">
            <button
              v-if="document.status === 'Neu'"
              class="btn btn--warning"
              @click="setInPruefung"
            >
              <i class="pi pi-search"></i> In Prüfung setzen
            </button>
            <button
              v-if="document.status === 'In Pruefung'"
              class="btn btn--success"
              @click="verbuchen"
            >
              <i class="pi pi-check"></i> Bestätigen & Verbuchen
            </button>
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

.card__hint {
  font-size: 0.72rem;
  color: #9ca3af;
  font-weight: 400;
  background: #f3f4f6;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

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

.journal-status--suggestion {
  background: #fef3c7;
  color: #b45309;
}

.actions-card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
}

.actions-card h3 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
  color: #1f2937;
}

.actions-card__buttons {
  display: flex;
  gap: 0.75rem;
}

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

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
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

.btn--outline {
  background: white;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

.btn--outline:hover {
  border-color: #0B3D91;
  color: #0B3D91;
}

.btn--outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--sm {
  padding: 0.35rem 0.65rem;
  font-size: 0.8rem;
}

.btn--warning {
  background: #f59e0b;
  color: white;
}

.btn--warning:hover {
  background: #d97706;
}

.btn--success {
  background: #10b981;
  color: white;
}

.btn--success:hover {
  background: #059669;
}

.btn--secondary {
  background: #f3f4f6;
  color: #4b5563;
}
</style>
