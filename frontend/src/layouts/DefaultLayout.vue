<script setup lang="ts">
import { ref } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'

const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

function toggleSidebar() {
  if (window.innerWidth <= 768) {
    mobileMenuOpen.value = !mobileMenuOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="default-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Mobile overlay -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
    <AppSidebar :collapsed="sidebarCollapsed" :class="{ 'sidebar--mobile-open': mobileMenuOpen }" @navigate="closeMobileMenu" />
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
  min-width: 0;
}

.sidebar-collapsed .default-layout__main {
  margin-left: 64px;
}

.default-layout__content {
  flex: 1;
  padding: 1.5rem 2rem;
  max-width: 1400px;
}

.mobile-overlay {
  display: none;
}

@media (max-width: 768px) {
  .default-layout__main {
    margin-left: 0;
  }

  .default-layout__content {
    padding: 1rem;
  }

  .mobile-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
}
</style>
