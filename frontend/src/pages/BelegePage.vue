<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDocumentStore } from '@/stores/documents'
import type { BelegStatus } from '@/types'
import StatusBadge from '@/components/StatusBadge.vue'
import UploadModal from '@/components/UploadModal.vue'

const router = useRouter()
const auth = useAuthStore()
const docs = useDocumentStore()

const isBuchhalter = computed(() => {
  const role = auth.currentUser?.role
  return role === 'Buchhalter' || role === 'Hauptbuchhalter'
})

onMounted(() => {
  if (auth.currentTenant) {
    docs.fetchDocuments(auth.currentTenant.id)
  }
})
const activeFilter = ref<'alle' | 'archiviert' | BelegStatus>('alle')
const showUploadModal = ref(false)

const filteredDocs = computed(() => {
  if (activeFilter.value === 'archiviert') return docs.archivedDocs
  if (activeFilter.value === 'alle') return docs.currentTenantDocs
  return docs.currentTenantDocs.filter((d) => d.status === activeFilter.value)
})

const filters: { key: 'alle' | 'archiviert' | BelegStatus; label: string }[] = [
  { key: 'alle', label: 'Alle' },
  { key: 'In Pruefung', label: 'In Prüfung' },
  { key: 'Verbucht', label: 'Verbucht' },
  { key: 'archiviert', label: 'Archiviert' },
]

function filterCount(key: 'alle' | 'archiviert' | BelegStatus): number {
  if (key === 'alle') return docs.countByStatus.alle
  if (key === 'In Pruefung') return docs.countByStatus.inPruefung
  if (key === 'archiviert') return docs.archivedDocs.length
  return docs.countByStatus.verbucht
}

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function goToDetail(id: string) {
  if (isBuchhalter.value) {
    router.push(`/belege/${id}`)
  }
}
</script>

<template>
  <div class="belege">
    <div class="belege__header">
      <div>
        <h1>Belege</h1>
        <p class="belege__subtitle">Verwalten Sie Ihre Rechnungen und Quittungen</p>
      </div>
      <button class="btn btn--primary" @click="showUploadModal = true">
        <i class="pi pi-upload"></i> Hochladen
      </button>
    </div>

    <div class="belege__filters">
      <button
        v-for="f in filters"
        :key="f.key"
        class="filter-tab"
        :class="{ 'filter-tab--active': activeFilter === f.key }"
        @click="activeFilter = f.key"
      >
        {{ f.label }}
        <span class="filter-tab__count">{{ filterCount(f.key) }}</span>
      </button>
    </div>

    <div class="belege__table card">
      <div v-if="filteredDocs.length === 0" class="empty-state">
        <i class="pi pi-inbox empty-state__icon"></i>
        <p>Keine Belege gefunden</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>Dateiname</th>
            <th>Datum</th>
            <th>Lieferant</th>
            <th style="text-align: right">Betrag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="doc in filteredDocs"
            :key="doc.id"
            :class="{ 'table__row--clickable': isBuchhalter }"
            @click="goToDetail(doc.id)"
          >
            <td>
              <div class="file-info">
                <i :class="doc.dateityp === 'pdf' ? 'pi pi-file-pdf' : 'pi pi-image'" class="file-info__icon"></i>
                <span class="file-info__name">{{ doc.dateiname }}</span>
              </div>
            </td>
            <td>{{ doc.ocrResult ? formatDate(doc.ocrResult.datum) : '–' }}</td>
            <td>{{ doc.ocrResult?.lieferant || '–' }}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 500">
              {{ doc.ocrResult ? formatCHF(doc.ocrResult.betrag) : '–' }}
            </td>
            <td><StatusBadge :status="doc.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <UploadModal v-model:visible="showUploadModal" @uploaded="activeFilter = 'alle'" />
  </div>
</template>

<style scoped>
.belege__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.belege__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.belege__subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.belege__filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  background: white;
  color: #6b7280;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.15s;
}

.filter-tab:hover {
  border-color: #0B3D91;
  color: #0B3D91;
}

.filter-tab--active {
  background: #0B3D91;
  color: white;
  border-color: #0B3D91;
}

.filter-tab__count {
  font-size: 0.75rem;
  font-weight: 600;
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

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-info__icon {
  font-size: 1.1rem;
  color: #9ca3af;
}

.file-info__name {
  font-weight: 500;
  color: #1f2937;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.btn--primary {
  background: #0B3D91;
  color: white;
}

.btn--primary:hover {
  background: #092f73;
}

@media (max-width: 768px) {
  .belege__header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .belege__filters {
    flex-wrap: wrap;
  }

  .belege__table {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .table {
    min-width: 600px;
  }

  .file-info__name {
    max-width: 150px;
  }
}
</style>
