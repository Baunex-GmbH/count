<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const notifications = useNotificationStore()

const layout = computed(() => {
  return route.meta.layout === 'auth' ? 'auth' : 'default'
})
</script>

<template>
  <AuthLayout v-if="layout === 'auth'">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </AuthLayout>

  <DefaultLayout v-else>
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </DefaultLayout>

  <!-- Toast notifications -->
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="n in notifications.notifications"
          :key="n.id"
          class="toast"
          :class="'toast--' + n.severity"
          @click="notifications.remove(n.id)"
        >
          <i :class="{
            'pi pi-check-circle': n.severity === 'success',
            'pi pi-info-circle': n.severity === 'info',
            'pi pi-exclamation-triangle': n.severity === 'warn',
            'pi pi-times-circle': n.severity === 'error',
          }"></i>
          <div class="toast__content">
            <span class="toast__summary">{{ n.summary }}</span>
            <span v-if="n.detail" class="toast__detail">{{ n.detail }}</span>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
/* Global styles */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #1f2937;
  background: #f8f9fb;
}

/* Route transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 380px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  font-size: 0.88rem;
}

.toast--success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #047857;
}

.toast--info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.toast--warn {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #b45309;
}

.toast--error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.toast__content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.toast__summary {
  font-weight: 600;
}

.toast__detail {
  font-size: 0.8rem;
  opacity: 0.85;
}

.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
