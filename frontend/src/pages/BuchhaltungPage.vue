<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDocumentStore } from '@/stores/documents'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import StatusBadge from '@/components/StatusBadge.vue'

const router = useRouter()
const docs = useDocumentStore()
const auth = useAuthStore()
const notifications = useNotificationStore()
const selectedDocs = ref<Set<string>>(new Set())
const showRueckfrageDialog = ref(false)
const rueckfrageText = ref('')

// Fetch all user documents on mount
import { onMounted } from 'vue'
onMounted(() => docs.fetchAllUserDocuments())

const allDocsSorted = computed(() => {
  const userTenants = auth.currentUser?.tenantIds || []
  return docs.allDocs
    .filter((d) => d.status !== 'Verbucht')
    .filter((d) => userTenants.includes(d.tenantId))
})

function getTenantName(tenantId: string): string {
  return auth.allTenants.find((t) => t.id === tenantId)?.name || tenantId
}

function formatCHF(value: number): string {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(value)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function toggleSelect(docId: string) {
  if (selectedDocs.value.has(docId)) {
    selectedDocs.value.delete(docId)
  } else {
    selectedDocs.value.add(docId)
  }
}

function toggleSelectAll() {
  if (selectedDocs.value.size === allDocsSorted.value.length) {
    selectedDocs.value.clear()
  } else {
    allDocsSorted.value.forEach((d) => selectedDocs.value.add(d.id))
  }
}

function bulkConfirm() {
  selectedDocs.value.forEach((id) => {
    docs.setStatus(id, 'Verbucht')
  })
  notifications.success(`${selectedDocs.value.size} Belege verbucht`)
  selectedDocs.value.clear()
}

function openRueckfrage() {
  if (selectedDocs.value.size === 0) return
  rueckfrageText.value = ''
  showRueckfrageDialog.value = true
}

function sendRueckfrage() {
  notifications.info('Rückfrage gesendet', `Nachricht an ${selectedDocs.value.size} Beleg(e) gesendet (simuliert)`)
  showRueckfrageDialog.value = false
  selectedDocs.value.clear()
}
</script>

<template>
  <div class="buchhaltung">
    <div class="buchhaltung__header">
      <div>
        <h1>Buchhaltung</h1>
        <p class="buchhaltung__subtitle">Ihre zugewiesenen Mandanten – offene Belege</p>
      </div>
    </div>

    <div v-if="selectedDocs.size > 0" class="bulk-bar">
      <span>{{ selectedDocs.size }} ausgewählt</span>
      <div class="bulk-bar__actions">
        <button class="btn btn--success btn--sm" @click="bulkConfirm">
          <i class="pi pi-check"></i> Alle verbuchen
        </button>
        <button class="btn btn--outline btn--sm" @click="openRueckfrage">
          <i class="pi pi-envelope"></i> Rückfrage
        </button>
      </div>
    </div>

    <div class="card">
      <div v-if="allDocsSorted.length === 0" class="empty-state">
        <i class="pi pi-check-circle empty-state__icon"></i>
        <p>Alle Belege sind verbucht</p>
      </div>
      <table v-else class="table">
        <thead>
          <tr>
            <th style="width: 40px">
              <input type="checkbox" @change="toggleSelectAll" :checked="selectedDocs.size === allDocsSorted.length && allDocsSorted.length > 0" />
            </th>
            <th>Mandant</th>
            <th>Dateiname</th>
            <th>Lieferant</th>
            <th style="text-align: right">Betrag</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in allDocsSorted" :key="doc.id" class="table__row--clickable">
            <td @click.stop>
              <input type="checkbox" :checked="selectedDocs.has(doc.id)" @change="toggleSelect(doc.id)" />
            </td>
            <td>
              <span class="tenant-tag">{{ getTenantName(doc.tenantId) }}</span>
            </td>
            <td class="table__filename" @click="router.push(`/belege/${doc.id}`)">{{ doc.dateiname }}</td>
            <td>{{ doc.ocrResult?.lieferant || '–' }}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 500">
              {{ doc.ocrResult ? formatCHF(doc.ocrResult.betrag) : '–' }}
            </td>
            <td><StatusBadge :status="doc.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Rückfrage Dialog -->
    <Teleport to="body">
      <div v-if="showRueckfrageDialog" class="modal-overlay" @click.self="showRueckfrageDialog = false">
        <div class="modal">
          <div class="modal__header">
            <h3>Rückfrage senden</h3>
            <button class="modal__close" @click="showRueckfrageDialog = false">
              <i class="pi pi-times"></i>
            </button>
          </div>
          <div class="modal__body">
            <p style="font-size: 0.85rem; color: #6b7280; margin-bottom: 0.75rem">
              Nachricht an den Uploader ({{ selectedDocs.size }} Beleg(e)):
            </p>
            <textarea
              v-model="rueckfrageText"
              rows="4"
              class="form-textarea"
              placeholder="Bitte prüfen Sie den Betrag auf der Rechnung..."
            ></textarea>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem">
              <button class="btn btn--secondary" @click="showRueckfrageDialog = false">Abbrechen</button>
              <button class="btn btn--primary" @click="sendRueckfrage" :disabled="!rueckfrageText.trim()">Senden</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.buchhaltung__header {
  margin-bottom: 1.25rem;
}

.buchhaltung__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.buchhaltung__subtitle {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
}

.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.88rem;
  color: #1d4ed8;
}

.bulk-bar__actions {
  display: flex;
  gap: 0.5rem;
}

.tenant-tag {
  font-size: 0.78rem;
  font-weight: 500;
  background: #e8eef7;
  color: #0B3D91;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
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

.table__row--clickable:hover {
  background: #f9fafb;
}

.table__filename {
  font-weight: 500;
  color: #1f2937;
  cursor: pointer;
}

.table__filename:hover {
  color: #0B3D91;
  text-decoration: underline;
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal__header h3 { margin: 0; font-size: 1.1rem; }

.modal__close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
}

.modal__body { padding: 1.5rem; }

.form-textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #0B3D91;
  box-shadow: 0 0 0 3px rgba(11, 61, 145, 0.1);
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

.btn--primary { background: #0B3D91; color: white; }
.btn--secondary { background: #f3f4f6; color: #4b5563; }
.btn--success { background: #10b981; color: white; }
.btn--outline { background: white; border: 1px solid #e5e7eb; color: #4b5563; }
.btn--sm { padding: 0.35rem 0.65rem; font-size: 0.82rem; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
