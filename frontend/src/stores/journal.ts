import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JournalEntry, JournalLine, Konto } from '@/types'
import { useAuthStore } from './auth'
import { apiGetJournal, apiCreateJournalEntry, apiGetKontenrahmen } from '@/services/api'
import { useNotificationStore } from './notifications'

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([])
  const kontenrahmenCache = ref<Konto[]>([])
  const loading = ref(false)
  const authStore = useAuthStore()
  const notifications = useNotificationStore()

  const currentTenantEntries = computed(() => {
    if (!authStore.currentTenant) return []
    return entries.value
      .filter((e) => e.tenantId === authStore.currentTenant!.id)
      .sort((a, b) => new Date(b.buchungsDatum).getTime() - new Date(a.buchungsDatum).getTime())
  })

  const allEntries = computed(() => {
    return [...entries.value].sort((a, b) => new Date(b.buchungsDatum).getTime() - new Date(a.buchungsDatum).getTime())
  })

  async function fetchJournal(tenantId: string) {
    loading.value = true
    try {
      const result = await apiGetJournal(tenantId)
      const otherEntries = entries.value.filter((e) => e.tenantId !== tenantId)
      entries.value = [...otherEntries, ...result]
    } catch (e: any) {
      notifications.error('Fehler beim Laden', e.message)
    } finally {
      loading.value = false
    }
  }

  function getByDocumentId(documentId: string): JournalEntry | undefined {
    return entries.value.find((e) => e.documentId === documentId)
  }

  async function createEntryForDocument(
    documentId: string,
    tenantId: string,
    beschreibung: string,
    lines: Omit<JournalLine, 'id'>[],
  ): Promise<JournalEntry | null> {
    const entryCount = entries.value.filter((e) => e.tenantId === tenantId).length + 1
    try {
      const entry = await apiCreateJournalEntry({
        tenantId,
        documentId,
        buchungsDatum: new Date().toISOString().split('T')[0],
        belegnummer: `BEL-2024-${String(entryCount).padStart(3, '0')}`,
        beschreibung,
        status: 'OCR-Vorschlag',
        lines: lines.map((l) => ({
          kontoNummer: l.kontoNummer,
          kontoBezeichnung: l.kontoBezeichnung,
          soll: l.soll,
          haben: l.haben,
          text: l.text,
        })),
      })
      entries.value.push(entry)
      return entry
    } catch (e: any) {
      notifications.error('Fehler', e.message)
      return null
    }
  }

  function confirmEntry(entryId: string) {
    const entry = entries.value.find((e) => e.id === entryId)
    if (entry) {
      entry.status = 'Manuell bestaetigt'
    }
  }

  async function getKontenrahmen(): Promise<Konto[]> {
    if (kontenrahmenCache.value.length > 0) return kontenrahmenCache.value
    try {
      const result = await apiGetKontenrahmen()
      kontenrahmenCache.value = result as Konto[]
      return kontenrahmenCache.value
    } catch {
      return []
    }
  }

  return {
    entries,
    loading,
    currentTenantEntries,
    allEntries,
    getByDocumentId,
    fetchJournal,
    createEntryForDocument,
    confirmEntry,
    getKontenrahmen,
  }
})
