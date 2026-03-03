<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'

const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}
</script>

<template>
  <div class="default-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <AppSidebar :collapsed="sidebarCollapsed" />
    <div class="default-layout__main">
      <AppTopbar @toggle-sidebar="toggleSidebar" />
      <main class="default-layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fb;
}

.default-layout__main {
  flex: 1;
  margin-left: 250px;
  transition: margin-left 0.2s ease;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed .default-layout__main {
  margin-left: 64px;
}

.default-layout__content {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1400px;
}

@media (max-width: 768px) {
  .default-layout__main {
    margin-left: 64px;
  }
}
</style>
