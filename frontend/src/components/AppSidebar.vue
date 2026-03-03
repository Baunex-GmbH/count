<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isBuchhalter = computed(() => {
  return auth.currentUser?.role === 'Buchhalter' || auth.currentUser?.role === 'Hauptbuchhalter'
})

const isHauptbuchhalter = computed(() => {
  return auth.currentUser?.role === 'Hauptbuchhalter'
})

const menuItems = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/' },
    { label: 'Belege', icon: 'pi pi-file', route: '/belege' },
  ]
  if (isBuchhalter.value) {
    items.push({ label: 'Journal', icon: 'pi pi-book', route: '/journal' })
    items.push({ label: 'Buchhaltung', icon: 'pi pi-calculator', route: '/buchhaltung' })
  }
  if (isHauptbuchhalter.value) {
    items.push({ label: 'Einstellungen', icon: 'pi pi-cog', route: '/einstellungen' })
  }
  return items
})

function isActive(path: string): boolean {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed }">
    <div class="sidebar__header">
      <div class="sidebar__logo">
        <span class="sidebar__logo-icon">+</span>
        <span v-if="!collapsed" class="sidebar__logo-text">Count</span>
      </div>
    </div>

    <div v-if="!collapsed && auth.currentTenant" class="sidebar__tenant">
      <span class="sidebar__tenant-name">{{ auth.currentTenant.name }}</span>
      <span class="sidebar__tenant-plan">{{ auth.currentTenant.plan }}</span>
    </div>

    <nav class="sidebar__nav">
      <button
        v-for="item in menuItems"
        :key="item.route"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item.route) }"
        @click="navigate(item.route)"
        :title="item.label"
      >
        <i :class="item.icon" class="sidebar__item-icon"></i>
        <span v-if="!collapsed" class="sidebar__item-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar__footer">
      <div v-if="!collapsed" class="sidebar__trust-badge">
        <span>🇨🇭</span>
        <span class="sidebar__trust-text">Datenhaltung Schweiz</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  background: #0B3D91;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  z-index: 100;
  overflow: hidden;
}

.sidebar--collapsed {
  width: 64px;
}

.sidebar__header {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar__logo-icon {
  font-size: 1.5rem;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.15);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.sidebar__logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  white-space: nowrap;
}

.sidebar__tenant {
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__tenant-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__tenant-plan {
  display: block;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.sidebar__nav {
  flex: 1;
  padding: 0.75rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s ease;
  width: 100%;
  text-align: left;
}

.sidebar__item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar__item--active {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-weight: 600;
}

.sidebar__item-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar__item-label {
  white-space: nowrap;
}

.sidebar__footer {
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar__trust-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.sidebar__trust-text {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .sidebar {
    width: 64px;
  }
}
</style>
