import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: { layout: 'auth', requiresAuth: false },
    },
    {
      path: '/tenant-select',
      name: 'tenant-select',
      component: () => import('@/pages/TenantSelectPage.vue'),
      meta: { layout: 'auth', requiresAuth: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/pages/DashboardPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true },
    },
    {
      path: '/belege',
      name: 'belege',
      component: () => import('@/pages/BelegePage.vue'),
      meta: { requiresAuth: true, requiresTenant: true },
    },
    {
      path: '/belege/:id',
      name: 'beleg-detail',
      component: () => import('@/pages/BelegDetailPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true },
    },
    {
      path: '/journal',
      name: 'journal',
      component: () => import('@/pages/JournalPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true, minRole: 'Buchhalter' },
    },
    {
      path: '/buchhaltung',
      name: 'buchhaltung',
      component: () => import('@/pages/BuchhaltungPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true, minRole: 'Buchhalter' },
    },
    {
      path: '/mandanten',
      name: 'mandanten',
      component: () => import('@/pages/MandantenPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true, minRole: 'Buchhalter' },
    },
    {
      path: '/einstellungen',
      name: 'einstellungen',
      component: () => import('@/pages/EinstellungenPage.vue'),
      meta: { requiresAuth: true, requiresTenant: true, minRole: 'Hauptbuchhalter' },
    },
  ],
})

const roleLevel: Record<string, number> = {
  'User': 0,
  'Buchhalter': 1,
  'Hauptbuchhalter': 2,
}

let sessionRestored = false

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Try to restore session from stored token on first navigation
  if (!sessionRestored) {
    sessionRestored = true
    if (!auth.isAuthenticated && localStorage.getItem('count_token')) {
      await auth.restoreSession()
    }
  }

  if (to.meta.requiresAuth !== false && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresTenant && !auth.hasTenantSelected) {
    return { name: 'tenant-select' }
  }

  if (to.meta.minRole) {
    const userLevel = roleLevel[auth.currentUser?.role || 'User'] ?? 0
    const requiredLevel = roleLevel[to.meta.minRole as string] ?? 0
    if (userLevel < requiredLevel) {
      return { name: 'dashboard' }
    }
  }

  // Redirect authenticated users away from login
  if (to.name === 'login' && auth.isAuthenticated) {
    if (auth.hasTenantSelected) return { name: 'dashboard' }
    return { name: 'tenant-select' }
  }
})

export default router
