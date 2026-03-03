import { computed } from 'vue'
import type { Document, AuditEntry } from '@/types'

export function useAuditLog(getDocument: () => Document | undefined) {
  const auditEntries = computed<AuditEntry[]>(() => {
    const doc = getDocument()
    if (!doc) return []
    return [...doc.auditLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
  })

  function formatTimestamp(iso: string): string {
    const d = new Date(iso)
    return d.toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { auditEntries, formatTimestamp }
}
