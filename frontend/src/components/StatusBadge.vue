<script setup lang="ts">
import { computed } from 'vue'
import type { BelegStatus } from '@/types'

const props = defineProps<{ status: BelegStatus }>()

const config = computed(() => {
  const map: Record<BelegStatus, { label: string; class: string }> = {
    'In Pruefung': { label: 'In Prüfung', class: 'badge--pruefung' },
    'Verbucht': { label: 'Verbucht', class: 'badge--verbucht' },
    'Archiviert': { label: 'Archiviert', class: 'badge--archiviert' },
  }
  return map[props.status]
})
</script>

<template>
  <span class="badge" :class="config.class">{{ config.label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge--pruefung {
  background: #fef3c7;
  color: #b45309;
}

.badge--verbucht {
  background: #d1fae5;
  color: #047857;
}

.badge--archiviert {
  background: #e5e7eb;
  color: #6b7280;
}
</style>
