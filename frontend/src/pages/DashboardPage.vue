<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDocumentStore } from '@/stores/documents'
import { useJournalStore } from '@/stores/journal'
import StatusBadge from '@/components/StatusBadge.vue'
import SwissTrustBadge from '@/components/SwissTrustBadge.vue'

const auth = useAuthStore()
const docs = useDocumentStore()
const journal = useJournalStore()
const router = useRouter()

onMounted(() => {
  if (auth.currentTenant) {
    docs.fetchDocuments(auth.currentTenant.id)
    journal.fetchJournal(auth.currentTenant.id)
  }
})

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

const journalStats = computed(() => {
  const entries = journal.currentTenantEntries
  return {
    total: entries.length,
    ocrVorschlag: entries.filter((e) => e.status === 'OCR-Vorschlag').length,
    bestaetigt: entries.filter((e) => e.status === 'Manuell bestaetigt').length,
  }
})

const offenerBetrag = computed(() => {
  return docs.currentTenantDocs
    .filter((d) => d.status === 'In Pruefung' && d.ocrResult)
    .reduce((sum, d) => sum + Math.abs(d.ocrResult!.betrag), 0)
})

const recentActivity = computed(() => {
  const activities: { icon: string; iconClass: string; text: string; time: string; date: Date }[] = []

  // Documents as activities
  for (const doc of docs.currentTenantDocs.slice(0, 10)) {
    const date = new Date(doc.uploadDatum)
    if (doc.status === 'Verbucht') {
      activities.push({
        icon: 'pi pi-check-circle',
        iconClass: 'activity__icon--green',
        text: `${doc.ocrResult?.lieferant || doc.dateiname} verbucht`,
        time: formatRelativeTime(date),
        date,
      })
    } else if (doc.status === 'In Pruefung') {
      activities.push({
        icon: 'pi pi-clock',
        iconClass: 'activity__icon--orange',
        text: `${doc.ocrResult?.lieferant || doc.dateiname} wartet auf Prüfung`,
        time: formatRelativeTime(date),
        date,
      })
    }
  }

  return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6)
})

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Heute'
  if (diffDays === 1) return 'Gestern'
  if (diffDays < 7) return `vor ${diffDays} Tagen`
  return date.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

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
      <div>
        <h1>{{ greeting }}, {{ auth.currentUser?.name?.split(' ')[0] }}</h1>
        <p class="dashboard__subtitle">Übersicht für {{ auth.currentTenant?.name }}</p>
      </div>
      <button class="btn btn--primary" @click="router.push('/belege')">
        <i class="pi pi-upload"></i> Beleg hochladen
      </button>
    </div>

    <div class="stats-grid">
      <div class="stat-card" @click="router.push('/belege')">
        <div class="stat-card__icon stat-card__icon--blue">
          <i class="pi pi-file"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ docs.countByStatus.alle }}</span>
          <span class="stat-card__label">Belege gesamt</span>
        </div>
      </div>
      <div class="stat-card stat-card--alert" @click="router.push('/belege')">
        <div class="stat-card__icon stat-card__icon--orange">
          <i class="pi pi-clock"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ docs.countByStatus.inPruefung }}</span>
          <span class="stat-card__label">In Prüfung</span>
        </div>
        <span v-if="docs.countByStatus.inPruefung > 0" class="stat-card__badge">offen</span>
      </div>
      <div class="stat-card" @click="router.push('/journal')">
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
          <span class="stat-card__label">Verbucht (Total)</span>
        </div>
      </div>
    </div>

    <!-- Secondary stats row -->
    <div class="secondary-stats">
      <div class="secondary-stat">
        <i class="pi pi-book secondary-stat__icon"></i>
        <div>
          <span class="secondary-stat__value">{{ journalStats.total }}</span>
          <span class="secondary-stat__label">Buchungen</span>
        </div>
      </div>
      <div class="secondary-stat__divider"></div>
      <div class="secondary-stat">
        <i class="pi pi-sparkles secondary-stat__icon"></i>
        <div>
          <span class="secondary-stat__value">{{ journalStats.ocrVorschlag }}</span>
          <span class="secondary-stat__label">OCR-Vorschläge</span>
        </div>
      </div>
      <div class="secondary-stat__divider"></div>
      <div class="secondary-stat">
        <i class="pi pi-verified secondary-stat__icon"></i>
        <div>
          <span class="secondary-stat__value">{{ journalStats.bestaetigt }}</span>
          <span class="secondary-stat__label">Bestätigt</span>
        </div>
      </div>
      <div class="secondary-stat__divider"></div>
      <div class="secondary-stat">
        <i class="pi pi-exclamation-circle secondary-stat__icon secondary-stat__icon--warn"></i>
        <div>
          <span class="secondary-stat__value">{{ formatCHF(offenerBetrag) }}</span>
          <span class="secondary-stat__label">Offener Betrag</span>
        </div>
      </div>
    </div>

    <div class="dashboard__row">
      <div class="dashboard__main">
        <!-- Recent documents table -->
        <div class="card">
          <div class="card__header">
            <h3>Letzte Belege</h3>
            <button class="card__link" @click="router.push('/belege')">Alle anzeigen <i class="pi pi-arrow-right" style="font-size: 0.75rem"></i></button>
          </div>
          <div v-if="recentDocs.length === 0" class="empty-state">
            <i class="pi pi-inbox empty-state__icon"></i>
            <p>Noch keine Belege vorhanden</p>
            <button class="btn btn--primary btn--sm" @click="router.push('/belege')">Ersten Beleg hochladen</button>
          </div>
          <div v-else class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Dateiname</th>
                  <th>Lieferant</th>
                  <th>Datum</th>
                  <th>Betrag</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in recentDocs" :key="doc.id" class="table__row--clickable" @click="goToBeleg(doc.id)">
                  <td class="table__filename">
                    <i class="pi pi-file-pdf table__file-icon"></i>
                    {{ doc.dateiname }}
                  </td>
                  <td>{{ doc.ocrResult?.lieferant || '–' }}</td>
                  <td class="table__date">{{ doc.ocrResult?.datum ? new Date(doc.ocrResult.datum).toLocaleDateString('de-CH') : '–' }}</td>
                  <td class="table__amount">{{ doc.ocrResult ? formatCHF(doc.ocrResult.betrag) : '–' }}</td>
                  <td><StatusBadge :status="doc.status" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="dashboard__sidebar">
        <!-- Activity Feed -->
        <div class="card">
          <div class="card__header">
            <h3>Aktivität</h3>
          </div>
          <div v-if="recentActivity.length === 0" class="empty-state empty-state--sm">
            <p>Noch keine Aktivität</p>
          </div>
          <div v-else class="activity-feed">
            <div v-for="(act, i) in recentActivity" :key="i" class="activity-item">
              <div class="activity-item__dot" :class="act.iconClass"></div>
              <div class="activity-item__content">
                <span class="activity-item__text">{{ act.text }}</span>
                <span class="activity-item__time">{{ act.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info card -->
        <div class="card">
          <div class="card__header">
            <h3>Mandant</h3>
          </div>
          <div class="info-list">
            <div class="info-item">
              <span class="info-item__label">Firma</span>
              <span class="info-item__value">{{ auth.currentTenant?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">UID</span>
              <span class="info-item__value" style="font-family: monospace; font-size: 0.8rem">{{ auth.currentTenant?.uid }}</span>
            </div>
            <div class="info-item">
              <span class="info-item__label">Abo</span>
              <span class="info-item__value">
                <span class="plan-badge" :class="'plan-badge--' + (auth.currentTenant?.plan || '').toLowerCase()">
                  {{ auth.currentTenant?.plan }}
                </span>
              </span>
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
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

.btn--primary {
  background: #0B3D91;
  color: white;
}

.btn--primary:hover {
  background: #092e6e;
}

.btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.82rem;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-card--alert {
  border-color: #fed7aa;
  background: #fffbf5;
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

.stat-card__badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #fb923c;
  color: white;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

/* Secondary Stats */
.secondary-stats {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.85rem 1.5rem;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
  overflow-x: auto;
}

.secondary-stat {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  white-space: nowrap;
}

.secondary-stat div {
  display: flex;
  flex-direction: column;
}

.secondary-stat__icon {
  font-size: 1rem;
  color: #6b7280;
}

.secondary-stat__icon--warn {
  color: #dc2626;
}

.secondary-stat__value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
}

.secondary-stat__label {
  font-size: 0.72rem;
  color: #9ca3af;
}

.secondary-stat__divider {
  width: 1px;
  height: 28px;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* Main Layout */
.dashboard__row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
}

.dashboard__sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Cards */
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
  font-size: 0.82rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.card__link:hover {
  text-decoration: underline;
}

/* Table */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  text-align: left;
  padding: 0.6rem 1.25rem;
  font-size: 0.75rem;
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
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.table__file-icon {
  color: #dc2626;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.table__amount {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-weight: 500;
}

.table__date {
  color: #6b7280;
  font-size: 0.85rem;
}

/* Activity Feed */
.activity-feed {
  padding: 0.5rem 0;
}

.activity-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.6rem 1.25rem;
  align-items: flex-start;
}

.activity-item:hover {
  background: #f9fafb;
}

.activity-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.activity-item__dot.activity__icon--green {
  background: #10b981;
}

.activity-item__dot.activity__icon--orange {
  background: #f59e0b;
}

.activity-item__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.activity-item__text {
  font-size: 0.82rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-item__time {
  font-size: 0.72rem;
  color: #9ca3af;
}

/* Info List */
.info-list {
  padding: 0.5rem 1.25rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item__label {
  font-size: 0.82rem;
  color: #6b7280;
}

.info-item__value {
  font-size: 0.82rem;
  font-weight: 500;
  color: #1f2937;
}

.plan-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.plan-badge--basis { background: #e5e7eb; color: #4b5563; }
.plan-badge--smart { background: #dbeafe; color: #1d4ed8; }
.plan-badge--complete { background: #fef3c7; color: #b45309; }

/* Empty State */
.empty-state {
  padding: 2.5rem;
  text-align: center;
  color: #9ca3af;
}

.empty-state--sm {
  padding: 1.5rem;
}

.empty-state__icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
}

/* Responsive */
@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 960px) {
  .dashboard__row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard__header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .dashboard__header .btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.85rem;
    gap: 0.65rem;
  }

  .stat-card__icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .stat-card__value {
    font-size: 1.05rem;
  }

  .secondary-stats {
    padding: 0.75rem 1rem;
    gap: 1rem;
  }

  .table {
    min-width: 550px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .stat-card__value {
    font-size: 0.95rem;
  }
}
</style>
