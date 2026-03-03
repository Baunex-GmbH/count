<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDocumentStore } from '@/stores/documents'
import StatusBadge from '@/components/StatusBadge.vue'
import SwissTrustBadge from '@/components/SwissTrustBadge.vue'

const auth = useAuthStore()
const docs = useDocumentStore()
const router = useRouter()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Guten Morgen'
  if (hour < 18) return 'Guten Tag'
  return 'Guten Abend'
})

const recentDocs = computed(() => docs.currentTenantDocs.slice(0, 5))

const lastUpload = computed(() => {
  const latest = docs.currentTenantDocs[0]
  if (!latest) return 'Keine Uploads'
  const d = new Date(latest.uploadDatum)
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
})

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function goToBeleg(id: string) {
  router.push(`/belege/${id}`)
}
</script>

<template>
  <div class="dashboard">
    <div class="dashboard__header">
      <h1>{{ greeting }}, {{ auth.currentUser?.name?.split(' ')[0] }}</h1>
      <p class="dashboard__subtitle">Übersicht für {{ auth.currentTenant?.name }}</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ docs.countByStatus.alle }}</span>
          <span class="stat-card__label">Alle Belege</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">
          <i class="pi pi-search"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ docs.countByStatus.inPruefung }}</span>
          <span class="stat-card__label">In Prüfung</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ docs.countByStatus.verbucht }}</span>
          <span class="stat-card__label">Verbucht</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ formatCHF(docs.totalBetrag) }}</span>
          <span class="stat-card__label">Gesamtbetrag (verbucht)</span>
        </div>
      </div>
    </div>

    <div class="dashboard__row">
      <div class="dashboard__recent">
        <div class="card">
          <div class="card__header">
            <h3>Letzte Belege</h3>
            <button class="card__link" @click="router.push('/belege')">Alle anzeigen →</button>
          </div>
          <div v-if="recentDocs.length === 0" class="empty-state">
            <i class="pi pi-inbox empty-state__icon"></i>
            <p>Noch keine Belege vorhanden</p>
            <button class="btn btn--primary btn--sm" @click="router.push('/belege')">Ersten Beleg hochladen</button>
          </div>
          <table v-else class="table">
            <thead>
              <tr>
                <th>Dateiname</th>
                <th>Lieferant</th>
                <th>Betrag</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="doc in recentDocs" :key="doc.id" class="table__row--clickable" @click="goToBeleg(doc.id)">
                <td class="table__filename">{{ doc.dateiname }}</td>
                <td>{{ doc.ocrResult?.lieferant || '–' }}</td>
                <td class="table__amount">{{ doc.ocrResult ? formatCHF(doc.ocrResult.betrag) : '–' }}</td>
                <td><StatusBadge :status="doc.status" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="dashboard__info">
        <div class="card">
          <div class="card__header">
            <h3>Informationen</h3>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-item__label">Mandant</span>
              <span class="info-item__value">{{ auth.currentTenant?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">UID</span>
              <span class="info-item__value" style="font-family: monospace">{{ auth.currentTenant?.uid }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Abo</span>
              <span class="info-item__value">{{ auth.currentTenant?.plan }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Letzter Upload</span>
              <span class="info-item__value">{{ lastUpload }}</span>
            </div>
          </div>
        </div>
        <SwissTrustBadge />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard__header {
  margin-bottom: 1.5rem;
}

.dashboard__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.dashboard__subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e5e7eb;
}

.stat-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-card__icon--blue { background: #dbeafe; color: #1d4ed8; }
.stat-card__icon--orange { background: #fef3c7; color: #b45309; }
.stat-card__icon--green { background: #d1fae5; color: #047857; }
.stat-card__icon--purple { background: #ede9fe; color: #7c3aed; }

.stat-card__body {
  display: flex;
  flex-direction: column;
}

.stat-card__value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-card__label {
  font-size: 0.8rem;
  color: #6b7280;
}

.dashboard__row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

@media (max-width: 960px) {
  .dashboard__row {
    grid-template-columns: 1fr;
  }
}

.dashboard__info {
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
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.card__header h3 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.card__link {
  background: none;
  border: none;
  color: #0B3D91;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 0.6rem 1.25rem;
  font-size: 0.78rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
}

.table td {
  padding: 0.7rem 1.25rem;
  font-size: 0.88rem;
  border-top: 1px solid #f3f4f6;
}

.table__row--clickable {
  cursor: pointer;
}

.table__row--clickable:hover {
  background: #f9fafb;
}

.table__filename {
  font-weight: 500;
  color: #1f2937;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.table__amount {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 500;
}

.info-list {
  padding: 0.75rem 1.25rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item__label {
  font-size: 0.85rem;
  color: #6b7280;
}

.info-item__value {
  font-size: 0.85rem;
  font-weight: 500;
  color: #1f2937;
}

.empty-state {
  padding: 2.5rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state__icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
}

.btn--primary {
  background: #0B3D91;
  color: white;
}

.btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.82rem;
}
</style>
