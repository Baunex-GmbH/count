<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useJournalStore } from '@/stores/journal'
import { useNotificationStore } from '@/stores/notifications'

const auth = useAuthStore()
const journal = useJournalStore()
const notifications = useNotificationStore()

onMounted(() => {
  if (auth.currentTenant) {
    journal.fetchJournal(auth.currentTenant.id)
  }
})

const flatLines = computed(() => {
  const lines: {
    id: string
    belegnummer: string
    buchungsDatum: string
    kontoNummer: string
    kontoBezeichnung: string
    text: string
    soll: number
    haben: number
    status: string
  }[] = []

  for (const entry of journal.currentTenantEntries) {
    for (const line of entry.lines) {
      lines.push({
        id: line.id,
        belegnummer: entry.belegnummer,
        buchungsDatum: entry.buchungsDatum,
        kontoNummer: line.kontoNummer,
        kontoBezeichnung: line.kontoBezeichnung,
        text: line.text,
        soll: line.soll,
        haben: line.haben,
        status: entry.status,
      })
    }
  }

  return lines.sort((a, b) => a.buchungsDatum.localeCompare(b.buchungsDatum))
})

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function exportDATEV() {
  notifications.info('DATEV-Export', 'Export wird vorbereitet... (Demo)')
  setTimeout(() => {
    notifications.success('Export abgeschlossen', 'DATEV-Datei wurde heruntergeladen (simuliert)')
  }, 1500)
}

function exportCSV() {
  notifications.info('CSV-Export', 'Export wird vorbereitet... (Demo)')
  setTimeout(() => {
    notifications.success('Export abgeschlossen', 'CSV-Datei wurde heruntergeladen (simuliert)')
  }, 1000)
}
</script>

<template>
  <div class="journal">
    <div class="journal__header">
      <div>
        <h1>Journal</h1>
        <p class="journal__subtitle">Alle Buchungseinträge</p>
      </div>
      <div class="journal__actions">
        <button class="btn btn--outline" @click="exportCSV">
          <i class="pi pi-file"></i> CSV Export
        </button>
        <button class="btn btn--outline" @click="exportDATEV">
          <i class="pi pi-download"></i> DATEV Export
        </button>
      </div>
    </div>

    <div class="card">
      <div v-if="flatLines.length === 0" class="empty-state">
        <i class="pi pi-book empty-state__icon"></i>
        <p>Noch keine Buchungen vorhanden</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Datum</th>
            <th>Beleg-Nr.</th>
            <th>Konto</th>
            <th>Bezeichnung</th>
            <th>Text</th>
            <th style="text-align: right">Soll</th>
            <th style="text-align: right">Haben</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in flatLines" :key="line.id">
            <td>{{ formatDate(line.buchungsDatum) }}</td>
            <td class="journal__belegnr">{{ line.belegnummer }}</td>
            <td class="journal__konto">{{ line.kontoNummer }}</td>
            <td>{{ line.kontoBezeichnung }}</td>
            <td class="journal__text">{{ line.text }}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 500">
              {{ line.soll > 0 ? formatCHF(line.soll) : '' }}
            </td>
            <td style="text-align: right; font-family: monospace; font-weight: 500">
              {{ line.haben > 0 ? formatCHF(line.haben) : '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.journal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.journal__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.journal__subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.journal__actions {
  display: flex;
  gap: 0.5rem;
}

.journal__belegnr {
  font-family: monospace;
  font-weight: 600;
  color: #0B3D91;
}

.journal__konto {
  font-family: monospace;
  font-weight: 600;
  color: #0B3D91;
}

.journal__text {
  color: #6b7280;
}

.card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 0.7rem 1rem;
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table td {
  padding: 0.75rem 1rem;
  font-size: 0.88rem;
  border-bottom: 1px solid #f3f4f6;
}

.empty-state {
  padding: 3rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state__icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
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
</style>
