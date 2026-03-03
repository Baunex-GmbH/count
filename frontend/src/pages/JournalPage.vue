<script setup lang="ts">
import { ref } from 'vue'
import { useJournalStore } from '@/stores/journal'
import { useNotificationStore } from '@/stores/notifications'

const journal = useJournalStore()
const notifications = useNotificationStore()
const expandedRows = ref<Set<string>>(new Set())

function toggleRow(id: string) {
  if (expandedRows.value.has(id)) {
    expandedRows.value.delete(id)
  } else {
    expandedRows.value.add(id)
  }
}

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function totalSoll(lines: { soll: number }[]): number {
  return lines.reduce((sum, l) => sum + l.soll, 0)
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
      <div v-if="journal.currentTenantEntries.length === 0" class="empty-state">
        <i class="pi pi-book empty-state__icon"></i>
        <p>Noch keine Buchungen vorhanden</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th style="width: 40px"></th>
            <th>Belegnr.</th>
            <th>Datum</th>
            <th>Beschreibung</th>
            <th style="text-align: right">Betrag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody v-for="entry in journal.currentTenantEntries" :key="entry.id">
          <tr class="table__row--clickable" @click="toggleRow(entry.id)">
            <td>
              <i :class="expandedRows.has(entry.id) ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" style="font-size: 0.8rem; color: #9ca3af"></i>
            </td>
            <td class="journal__belegnr">{{ entry.belegnummer }}</td>
            <td>{{ formatDate(entry.buchungsDatum) }}</td>
            <td>{{ entry.beschreibung }}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 500">
              {{ formatCHF(totalSoll(entry.lines)) }}
            </td>
            <td>
              <span class="journal-status" :class="entry.status === 'Manuell bestaetigt' ? 'journal-status--confirmed' : 'journal-status--suggestion'">
                {{ entry.status === 'Manuell bestaetigt' ? 'Bestätigt' : 'OCR-Vorschlag' }}
              </span>
            </td>
          </tr>
          <tr v-if="expandedRows.has(entry.id)" class="expanded-row">
            <td colspan="6">
              <div class="expanded-content">
                <table class="lines-table">
                  <thead>
                    <tr>
                      <th>Konto</th>
                      <th>Bezeichnung</th>
                      <th>Text</th>
                      <th style="text-align: right">Soll</th>
                      <th style="text-align: right">Haben</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="line in entry.lines" :key="line.id">
                      <td class="lines-table__konto">{{ line.kontoNummer }}</td>
                      <td>{{ line.kontoBezeichnung }}</td>
                      <td style="color: #6b7280">{{ line.text }}</td>
                      <td style="text-align: right; font-family: monospace">{{ line.soll > 0 ? formatCHF(line.soll) : '' }}</td>
                      <td style="text-align: right; font-family: monospace">{{ line.haben > 0 ? formatCHF(line.haben) : '' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
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

.table__row--clickable {
  cursor: pointer;
}

.table__row--clickable:hover {
  background: #f9fafb;
}

.expanded-row td {
  padding: 0;
  background: #f9fafb;
}

.expanded-content {
  padding: 0.75rem 1rem 0.75rem 2.5rem;
}

.lines-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.lines-table th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-size: 0.72rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  background: #f3f4f6;
}

.lines-table td {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-top: 1px solid #f3f4f6;
}

.lines-table__konto {
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
