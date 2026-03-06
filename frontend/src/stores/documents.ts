import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, BelegStatus, OcrResult } from '@/types'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notifications'
import { useOcrSimulation } from '@/composables/useOcrSimulation'
import { apiGetDocuments, apiUpdateDocumentStatus, apiUpdateDocumentOcr, apiGetDocument, apiArchiveDocument, apiRestoreDocument, apiDeleteDocument } from '@/services/api'

export const useDocumentStore = defineStore('documents', () => {
  const docs = ref<Document[]>([])
  const loading = ref(false)
  const authStore = useAuthStore()
  const notifications = useNotificationStore()
  const { mutateOcrResult } = useOcrSimulation()

  const currentTenantDocs = computed(() => {
    if (!authStore.currentTenant) return []
    return docs.value
      .filter((d) => d.tenantId === authStore.currentTenant!.id && d.status !== 'Archiviert')
      .sort((a, b) => new Date(b.uploadDatum).getTime() - new Date(a.uploadDatum).getTime())
  })

  const archivedDocs = computed(() => {
    if (!authStore.currentTenant) return []
    return docs.value
      .filter((d) => d.tenantId === authStore.currentTenant!.id && d.status === 'Archiviert')
      .sort((a, b) => new Date(b.uploadDatum).getTime() - new Date(a.uploadDatum).getTime())
  })

  const allDocs = computed(() => {
    return [...docs.value].sort((a, b) => new Date(b.uploadDatum).getTime() - new Date(a.uploadDatum).getTime())
  })

  const countByStatus = computed(() => {
    const tenantDocs = currentTenantDocs.value
    return {
      alle: tenantDocs.length,
      inPruefung: tenantDocs.filter((d) => d.status === 'In Pruefung').length,
      verbucht: tenantDocs.filter((d) => d.status === 'Verbucht').length,
    }
  })

  const totalBetrag = computed(() => {
    return currentTenantDocs.value
      .filter((d) => d.status === 'Verbucht' && d.ocrResult)
      .reduce((sum, d) => sum + Math.abs(d.ocrResult!.betrag), 0)
  })

  async function fetchDocuments(tenantId: string) {
    loading.value = true
    try {
      const result = await apiGetDocuments(tenantId)
      // Replace docs for this tenant, keep others
      const otherDocs = docs.value.filter((d) => d.tenantId !== tenantId)
      docs.value = [...otherDocs, ...result]
    } catch (e: any) {
      notifications.error('Fehler beim Laden', e.message)
    } finally {
      loading.value = false
    }
  }

  async function fetchAllUserDocuments() {
    if (!authStore.currentUser) return
    loading.value = true
    try {
      const allResults: Document[] = []
      for (const tenantId of authStore.currentUser.tenantIds) {
        const result = await apiGetDocuments(tenantId)
        allResults.push(...result)
      }
      docs.value = allResults
    } catch (e: any) {
      notifications.error('Fehler beim Laden', e.message)
    } finally {
      loading.value = false
    }
  }

  function getById(id: string): Document | undefined {
    return docs.value.find((d) => d.id === id)
  }

  async function refreshDocument(id: string) {
    try {
      const updated = await apiGetDocument(id)
      const idx = docs.value.findIndex((d) => d.id === id)
      if (idx >= 0) {
        docs.value[idx] = updated
      } else {
        docs.value.push(updated)
      }
    } catch {
      // ignore
    }
  }

  async function setStatus(docId: string, newStatus: BelegStatus) {
    try {
      const updated = await apiUpdateDocumentStatus(docId, newStatus)
      const idx = docs.value.findIndex((d) => d.id === docId)
      if (idx >= 0) docs.value[idx] = updated

      const statusLabels: Record<BelegStatus, string> = {
        'In Pruefung': 'In Prüfung',
        'Verbucht': 'Verbucht',
        'Archiviert': 'Archiviert',
      }
      notifications.success('Status aktualisiert', `Beleg ist jetzt "${statusLabels[newStatus]}"`)
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  async function rerunOcr(docId: string) {
    const doc = docs.value.find((d) => d.id === docId)
    if (!doc || !doc.ocrResult) return

    const newOcr = mutateOcrResult(doc.ocrResult)
    try {
      const updated = await apiUpdateDocumentOcr(docId, newOcr)
      const idx = docs.value.findIndex((d) => d.id === docId)
      if (idx >= 0) docs.value[idx] = updated
      notifications.info('OCR aktualisiert', 'Texterkennung wurde erneut durchgeführt')
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  async function updateOcrResult(docId: string, ocrResult: OcrResult) {
    try {
      const updated = await apiUpdateDocumentOcr(docId, ocrResult)
      const idx = docs.value.findIndex((d) => d.id === docId)
      if (idx >= 0) docs.value[idx] = updated
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  async function archiveDocument(docId: string) {
    try {
      const updated = await apiArchiveDocument(docId)
      const idx = docs.value.findIndex((d) => d.id === docId)
      if (idx >= 0) docs.value[idx] = updated
      notifications.success('Archiviert', 'Beleg wurde archiviert')
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  async function restoreDocument(docId: string) {
    try {
      const updated = await apiRestoreDocument(docId)
      const idx = docs.value.findIndex((d) => d.id === docId)
      if (idx >= 0) docs.value[idx] = updated
      notifications.success('Wiederhergestellt', 'Beleg wurde wiederhergestellt')
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  async function deleteDocument(docId: string) {
    try {
      await apiDeleteDocument(docId)
      docs.value = docs.value.filter((d) => d.id !== docId)
      notifications.success('Gelöscht', 'Beleg wurde endgültig gelöscht')
    } catch (e: any) {
      notifications.error('Fehler', e.message)
    }
  }

  function addUploadedDocument(doc: Document) {
    docs.value.unshift(doc)
    notifications.success('Beleg hochgeladen', `"${doc.dateiname}" wurde erfolgreich hochgeladen`)
  }

  return {
    docs,
    loading,
    currentTenantDocs,
    archivedDocs,
    allDocs,
    countByStatus,
    totalBetrag,
    getById,
    fetchDocuments,
    fetchAllUserDocuments,
    refreshDocument,
    setStatus,
    rerunOcr,
    updateOcrResult,
    archiveDocument,
    restoreDocument,
    deleteDocument,
    addUploadedDocument,
  }
})
