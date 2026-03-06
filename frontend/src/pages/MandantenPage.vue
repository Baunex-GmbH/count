<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDocumentStore } from '@/stores/documents'
import type { Tenant, Document } from '@/types'

const router = useRouter()
const auth = useAuthStore()
const docs = useDocumentStore()
const loading = ref(true)

onMounted(async () => {
  await docs.fetchAllUserDocuments()
  loading.value = false
})

interface TenantStats {
  tenant: Tenant
  totalDocs: number
  inPruefung: number
  verbucht: number
  archiviert: number
  offenerBetrag: number
  letzterUpload: string | null
}

const tenantStats = computed((): TenantStats[] => {
  return auth.availableTenants.map((tenant) => {
    const tenantDocs = docs.docs.filter((d: Document) => d.tenantId === tenant.id)
    const activeDocs = tenantDocs.filter((d: Document) => d.status !== 'Archiviert')
    const inPruefung = tenantDocs.filter((d: Document) => d.status === 'In Pruefung')
    const verbucht = tenantDocs.filter((d: Document) => d.status === 'Verbucht')
    const archiviert = tenantDocs.filter((d: Document) => d.status === 'Archiviert')

    const offenerBetrag = inPruefung
      .filter((d: Document) => d.ocrResult)
      .reduce((sum: number, d: Document) => sum + Math.abs(d.ocrResult!.betrag), 0)

    const sorted = [...activeDocs].sort(
      (a, b) => new Date(b.uploadDatum).getTime() - new Date(a.uploadDatum).getTime(),
    )

    return {
      tenant,
      totalDocs: activeDocs.length,
      inPruefung: inPruefung.length,
      verbucht: verbucht.length,
      archiviert: archiviert.length,
      offenerBetrag,
      letzterUpload: sorted[0]?.uploadDatum || null,
    }
  })
})

const totalInPruefung = computed(() => tenantStats.value.reduce((s, t) => s + t.inPruefung, 0))
const totalVerbucht = computed(() => tenantStats.value.reduce((s, t) => s + t.verbucht, 0))
const totalOffenerBetrag = computed(() => tenantStats.value.reduce((s, t) => s + t.offenerBetrag, 0))

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Heute'
  if (days === 1) return 'Gestern'
  if (days < 7) return `Vor ${days} Tagen`
  if (days < 30) return `Vor ${Math.floor(days / 7)} Wochen`
  return formatDate(iso)
}

function switchToTenant(tenantId: string) {
  auth.selectTenant(tenantId)
  router.push('/')
}

function goToBelege(tenantId: string) {
  auth.selectTenant(tenantId)
  router.push('/belege')
}
</script>

<template>
  <div class="mandanten">
    <div class="mandanten__header">
      <div>
        <h1>Mandanten</h1>
        <p class="mandanten__subtitle">Übersicht Ihrer {{ auth.availableTenants.length }} Mandanten</p>
      </div>
    </div>

    <!-- Aggregierte Statistiken -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--blue">
          <i class="pi pi-building"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ auth.availableTenants.length }}</span>
          <span class="stat-card__label">Mandanten</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--orange">
          <i class="pi pi-search"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ totalInPruefung }}</span>
          <span class="stat-card__label">Offene Belege</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--green">
          <i class="pi pi-check-circle"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ totalVerbucht }}</span>
          <span class="stat-card__label">Verbucht</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon stat-card__icon--purple">
          <i class="pi pi-wallet"></i>
        </div>
        <div class="stat-card__body">
          <span class="stat-card__value">{{ formatCHF(totalOffenerBetrag) }}</span>
          <span class="stat-card__label">Offener Betrag</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner"></i> Mandanten werden geladen...
    </div>

    <!-- Mandanten-Karten -->
    <div v-else class="mandanten-grid">
      <div
        v-for="ts in tenantStats"
        :key="ts.tenant.id"
        class="mandant-card"
        :class="{ 'mandant-card--active': auth.currentTenant?.id === ts.tenant.id }"
      >
        <div class="mandant-card__header">
          <div class="mandant-card__info">
            <div class="mandant-card__name-row">
              <h3 class="mandant-card__name">{{ ts.tenant.name }}</h3>
              <span
                v-if="auth.currentTenant?.id === ts.tenant.id"
                class="mandant-card__current"
              >Aktiv</span>
            </div>
          </div>
          <span
            class="plan-badge"
            :class="'plan-badge--' + ts.tenant.plan.toLowerCase()"
          >{{ ts.tenant.plan }}</span>
        </div>

        <div class="mandant-card__details">
          <div class="mandant-detail">
            <i class="pi pi-map-marker mandant-detail__icon"></i>
            <span>{{ ts.tenant.address }}</span>
          </div>
          <div class="mandant-detail">
            <i class="pi pi-id-card mandant-detail__icon"></i>
            <span class="mandant-detail__mono">{{ ts.tenant.uid }}</span>
          </div>
          <div class="mandant-detail">
            <i class="pi pi-tag mandant-detail__icon"></i>
            <span>Abo: <strong>{{ ts.tenant.plan }}</strong></span>
          </div>
        </div>

        <div class="mandant-card__stats">
          <div class="mandant-stat">
            <span class="mandant-stat__value" :class="{ 'mandant-stat__value--alert': ts.inPruefung > 0 }">
              {{ ts.inPruefung }}
            </span>
            <span class="mandant-stat__label">In Prüfung</span>
          </div>
          <div class="mandant-stat">
            <span class="mandant-stat__value">{{ ts.verbucht }}</span>
            <span class="mandant-stat__label">Verbucht</span>
          </div>
          <div class="mandant-stat">
            <span class="mandant-stat__value">{{ ts.totalDocs }}</span>
            <span class="mandant-stat__label">Total</span>
          </div>
          <div class="mandant-stat" v-if="ts.offenerBetrag > 0">
            <span class="mandant-stat__value mandant-stat__value--amount">{{ formatCHF(ts.offenerBetrag) }}</span>
            <span class="mandant-stat__label">Offen</span>
          </div>
        </div>

        <div class="mandant-card__meta">
          <span v-if="ts.letzterUpload" class="mandant-card__upload">
            <i class="pi pi-clock"></i> Letzter Upload: {{ timeAgo(ts.letzterUpload) }}
          </span>
          <span v-else class="mandant-card__upload mandant-card__upload--none">
            <i class="pi pi-clock"></i> Keine Uploads
          </span>
        </div>

        <div class="mandant-card__actions">
          <button class="btn btn--primary btn--sm" @click="switchToTenant(ts.tenant.id)">
            <i class="pi pi-home"></i> Dashboard
          </button>
          <button
            v-if="ts.inPruefung > 0"
            class="btn btn--outline btn--sm"
            @click="goToBelege(ts.tenant.id)"
          >
            <i class="pi pi-file"></i> {{ ts.inPruefung }} Belege prüfen
          </button>
          <button
            v-else
            class="btn btn--outline btn--sm"
            @click="goToBelege(ts.tenant.id)"
          >
            <i class="pi pi-file"></i> Belege
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mandanten__header {
  margin-bottom: 1.5rem;
}

.mandanten__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.mandanten__subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

/* Loading */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 0.9rem;
}

/* Mandanten grid */
.mandanten-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1rem;
}

/* Mandant card */
.mandant-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.mandant-card:hover {
  border-color: #0B3D91;
  box-shadow: 0 2px 12px rgba(11, 61, 145, 0.08);
}

.mandant-card--active {
  border-color: #0B3D91;
  box-shadow: 0 0 0 2px rgba(11, 61, 145, 0.1);
}

.mandant-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.mandant-card__info {
  flex: 1;
  min-width: 0;
}

.mandant-card__name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mandant-card__name {
  font-size: 1.05rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mandant-card__current {
  font-size: 0.7rem;
  font-weight: 600;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  white-space: nowrap;
}

.mandant-card__uid {
  font-size: 0.78rem;
  color: #9ca3af;
  font-family: monospace;
}

.plan-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}

.plan-badge--basis { background: #e5e7eb; color: #4b5563; }
.plan-badge--smart { background: #dbeafe; color: #1d4ed8; }
.plan-badge--complete { background: #fef3c7; color: #b45309; }

/* Details */
.mandant-card__details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.mandant-detail {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #4b5563;
}

.mandant-detail__icon {
  font-size: 0.8rem;
  color: #9ca3af;
  width: 16px;
  text-align: center;
  flex-shrink: 0;
}

.mandant-detail__mono {
  font-family: monospace;
  font-size: 0.8rem;
}

/* Stats row */
.mandant-card__stats {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
}

.mandant-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.mandant-stat__value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1f2937;
}

.mandant-stat__value--alert {
  color: #b45309;
}

.mandant-stat__value--amount {
  font-size: 0.9rem;
  font-family: monospace;
  color: #b45309;
}

.mandant-stat__label {
  font-size: 0.72rem;
  color: #6b7280;
}

/* Meta */
.mandant-card__meta {
  font-size: 0.8rem;
}

.mandant-card__upload {
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.mandant-card__upload--none {
  color: #d1d5db;
}

/* Actions */
.mandant-card__actions {
  display: flex;
  gap: 0.5rem;
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

.btn--sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.82rem;
}

.btn--primary {
  background: #0B3D91;
  color: white;
}

.btn--primary:hover {
  background: #092f73;
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

@media (max-width: 768px) {
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

  .mandanten-grid {
    grid-template-columns: 1fr;
  }

  .mandant-card__stats {
    flex-wrap: wrap;
  }

  .mandant-card__actions {
    flex-direction: column;
  }

  .mandant-card__actions .btn {
    justify-content: center;
  }
}
</style>
