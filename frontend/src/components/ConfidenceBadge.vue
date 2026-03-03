<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ confidence: number }>()

const colorClass = computed(() => {
  if (props.confidence >= 90) return 'confidence--high'
  if (props.confidence >= 80) return 'confidence--medium'
  return 'confidence--low'
})
</script>

<template>
  <span class="confidence" :class="colorClass">
    <i class="pi pi-eye" style="font-size: 0.7rem"></i>
    {{ confidence }}%
  </span>
</template>

<style scoped>
.confidence {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 600;
}

.confidence--high {
  background: #d1fae5;
  color: #047857;
}

.confidence--medium {
  background: #fef3c7;
  color: #b45309;
}

.confidence--low {
  background: #fee2e2;
  color: #dc2626;
}
</style>
