import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Document, BelegStatus, AuditEntry, OcrResult } from '@/types'
import { documents as seedDocuments } from '@/data/documents'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notifications'
import { useOcrSimulation } from '@/composables/useOcrSimulation'

export const useDocumentStore = defineStore('documents', () => {
  const docs = ref<Document[]>([...seedDocuments])
  const authStore = useAuthStore()
  const notifications = useNotificationStore()
  const { generateOcrResult, mutateOcrResult } = useOcrSimulation()

  const currentTenantDocs = computed(() => {
    if (!authStore.currentTenant) return []
    return docs.value
      .filter((d) => d.tenantId === authStore.currentTenant!.id)
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

  function getById(id: string): Document | undefined {
    return docs.value.find((d) => d.id === id)
  }

  function addAuditEntry(docId: string, action: string, details: string) {
    const doc = docs.value.find((d) => d.id === docId)
    if (!doc || !authStore.currentUser) return
    const entry: AuditEntry = {
      id: `audit-${Date.now()}`,
      documentId: docId,
      timestamp: new Date().toISOString(),
      userId: authStore.currentUser.id,
      userName: authStore.currentUser.name,
      action,
      details,
    }
    doc.auditLog.push(entry)
  }

  function updateOcrResult(docId: string, ocrResult: OcrResult) {
    const doc = docs.value.find((d) => d.id === docId)
    if (!doc) return
    doc.ocrResult = ocrResult
  }

  function setStatus(docId: string, newStatus: BelegStatus) {
    const doc = docs.value.find((d) => d.id === docId)
    if (!doc) return

    const oldStatus = doc.status
    doc.status = newStatus

    const statusLabels: Record<BelegStatus, string> = {
      'In Pruefung': 'In Prüfung',
      'Verbucht': 'Verbucht',
    }

    addAuditEntry(docId, `Status → ${statusLabels[newStatus]}`, `Status von "${statusLabels[oldStatus]}" auf "${statusLabels[newStatus]}" geändert`)
    notifications.success('Status aktualisiert', `Beleg ist jetzt "${statusLabels[newStatus]}"`)
  }

  function rerunOcr(docId: string) {
    const doc = docs.value.find((d) => d.id === docId)
    if (!doc || !doc.ocrResult) return

    doc.ocrResult = mutateOcrResult(doc.ocrResult)
    addAuditEntry(docId, 'OCR neu ausgeführt', `Texterkennung wiederholt (${doc.ocrResult.confidence}%)`)
    notifications.info('OCR aktualisiert', 'Texterkennung wurde erneut durchgeführt')
  }

  function uploadDocument(dateiname: string, dateityp: string, vorschauUrl: string | null, documentId?: string): Document {
    const id = documentId || `doc-${Date.now()}`

    const newDoc: Document = {
      id,
      tenantId: authStore.currentTenant!.id,
      dateiname,
      dateityp,
      uploadDatum: new Date().toISOString(),
      uploadedBy: authStore.currentUser!.id,
      status: 'In Pruefung',
      ocrResult: null,
      vorschauUrl,
      auditLog: [
        {
          id: `audit-${Date.now()}-1`,
          documentId: id,
          timestamp: new Date().toISOString(),
          userId: authStore.currentUser!.id,
          userName: authStore.currentUser!.name,
          action: 'Hochgeladen',
          details: 'Dokument hochgeladen – wartet auf Prüfung',
        },
      ],
    }

    docs.value.unshift(newDoc)
    notifications.success('Beleg hochgeladen', `"${dateiname}" wurde erfolgreich hochgeladen`)
    return newDoc
  }

  return {
    docs,
    currentTenantDocs,
    allDocs,
    countByStatus,
    totalBetrag,
    getById,
    setStatus,
    rerunOcr,
    updateOcrResult,
    uploadDocument,
    addAuditEntry,
  }
})
