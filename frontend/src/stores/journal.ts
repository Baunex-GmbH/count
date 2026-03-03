import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { JournalEntry, JournalLine } from '@/types'
import { journalEntries as seedEntries } from '@/data/journal'
import { useAuthStore } from './auth'
import { kontenrahmen } from '@/data/kontenrahmen'

export const useJournalStore = defineStore('journal', () => {
  const entries = ref<JournalEntry[]>([...seedEntries])
  const authStore = useAuthStore()

  const currentTenantEntries = computed(() => {
    if (!authStore.currentTenant) return []
    return entries.value
      .filter((e) => e.tenantId === authStore.currentTenant!.id)
      .sort((a, b) => new Date(b.buchungsDatum).getTime() - new Date(a.buchungsDatum).getTime())
  })

  const allEntries = computed(() => {
    return [...entries.value].sort((a, b) => new Date(b.buchungsDatum).getTime() - new Date(a.buchungsDatum).getTime())
  })

  function getByDocumentId(documentId: string): JournalEntry | undefined {
    return entries.value.find((e) => e.documentId === documentId)
  }

  function createEntryForDocument(
    documentId: string,
    tenantId: string,
    beschreibung: string,
    lines: Omit<JournalLine, 'id'>[],
  ): JournalEntry {
    const entryCount = entries.value.filter((e) => e.tenantId === tenantId).length + 1
    const entry: JournalEntry = {
      id: `journal-${Date.now()}`,
      tenantId,
      documentId,
      buchungsDatum: new Date().toISOString().split('T')[0],
      erfassungsDatum: new Date().toISOString(),
      belegnummer: `BEL-2024-${String(entryCount).padStart(3, '0')}`,
      beschreibung,
      status: 'OCR-Vorschlag',
      lines: lines.map((l, i) => ({ ...l, id: `jl-${Date.now()}-${i}` })),
    }
    entries.value.push(entry)
    return entry
  }

  function confirmEntry(entryId: string) {
    const entry = entries.value.find((e) => e.id === entryId)
    if (entry) {
      entry.status = 'Manuell bestaetigt'
    }
  }

  function getKontenrahmen() {
    return kontenrahmen
  }

  return {
    entries,
    currentTenantEntries,
    allEntries,
    getByDocumentId,
    createEntryForDocument,
    confirmEntry,
    getKontenrahmen,
  }
})
