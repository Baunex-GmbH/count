<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function select(tenantId: string) {
  auth.selectTenant(tenantId)
  router.push('/')
}
</script>

<template>
  <div>
    <h2 class="tenant-select__title">Mandant auswählen</h2>
    <p class="tenant-select__subtitle">Willkommen, {{ auth.currentUser?.name }}. Wählen Sie einen Mandanten.</p>

    <div class="tenant-select__grid">
      <button
        v-for="tenant in auth.availableTenants"
        :key="tenant.id"
        class="tenant-card"
        @click="select(tenant.id)"
      >
        <div class="tenant-card__icon">
          <i class="pi pi-building"></i>
        </div>
        <div class="tenant-card__info">
          <span class="tenant-card__name">{{ tenant.name }}</span>
          <span class="tenant-card__address">{{ tenant.address }}</span>
          <span class="tenant-card__uid">{{ tenant.uid }}</span>
        </div>
        <span class="tenant-card__plan" :class="'plan--' + tenant.plan.toLowerCase()">
          {{ tenant.plan }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tenant-select__title {
  text-align: center;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 1.3rem;
}

.tenant-select__subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.tenant-select__grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tenant-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  width: 100%;
}

.tenant-card:hover {
  border-color: #0B3D91;
  box-shadow: 0 2px 8px rgba(11, 61, 145, 0.1);
}

.tenant-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e8eef7;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0B3D91;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.tenant-card__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tenant-card__name {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.95rem;
}

.tenant-card__address {
  font-size: 0.8rem;
  color: #6b7280;
}

.tenant-card__uid {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

.tenant-card__plan {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.plan--starter {
  background: #e5e7eb;
  color: #4b5563;
}

.plan--professional {
  background: #dbeafe;
  color: #1d4ed8;
}

.plan--enterprise {
  background: #fef3c7;
  color: #b45309;
}
</style>
