<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const emit = defineEmits<{ 'toggle-sidebar': [] }>()
const auth = useAuthStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}

function switchTenant() {
  auth.currentTenant = null
  router.push('/tenant-select')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="topbar__menu-btn" @click="emit('toggle-sidebar')">
        <i class="pi pi-bars"></i>
      </button>
    </div>
    <div class="topbar__right">
      <button v-if="auth.availableTenants.length > 1" class="topbar__btn" @click="switchTenant" title="Mandant wechseln">
        <i class="pi pi-building"></i>
        <span class="topbar__btn-label">Mandant wechseln</span>
      </button>
      <div class="topbar__user">
        <span class="topbar__avatar">{{ auth.currentUser?.avatarInitials }}</span>
        <span class="topbar__user-name">{{ auth.currentUser?.name }}</span>
        <span class="topbar__user-role">({{ auth.currentUser?.role }})</span>
      </div>
      <button class="topbar__btn topbar__btn--logout" @click="logout" title="Abmelden">
        <i class="pi pi-sign-out"></i>
      </button>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar__left {
  display: flex;
  align-items: center;
}

.topbar__menu-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
}

.topbar__menu-btn:hover {
  background: #f3f4f6;
  color: #0B3D91;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
}

.topbar__btn:hover {
  border-color: #0B3D91;
  color: #0B3D91;
}

.topbar__btn--logout {
  border: none;
  padding: 0.4rem;
}

.topbar__btn-label {
  white-space: nowrap;
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0B3D91;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.topbar__user-name {
  font-weight: 500;
  color: #1f2937;
}

.topbar__user-role {
  color: #9ca3af;
}

@media (max-width: 768px) {
  .topbar__btn-label,
  .topbar__user-name,
  .topbar__user-role {
    display: none;
  }
}
</style>
