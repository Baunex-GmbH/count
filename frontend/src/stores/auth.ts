import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Tenant } from '@/types'
import { users } from '@/data/users'
import { tenants } from '@/data/tenants'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const currentTenant = ref<Tenant | null>(null)
  const isAuthenticated = computed(() => currentUser.value !== null)
  const hasTenantSelected = computed(() => currentTenant.value !== null)

  const availableTenants = computed(() => {
    if (!currentUser.value) return []
    return tenants.filter((t) => currentUser.value!.tenantIds.includes(t.id))
  })

  function login(email: string, _password: string): boolean {
    const user = users.find((u) => u.email === email)
    if (!user) return false
    currentUser.value = user
    // Auto-select tenant if only one
    if (user.tenantIds.length === 1) {
      currentTenant.value = tenants.find((t) => t.id === user.tenantIds[0]) || null
    }
    return true
  }

  function selectTenant(tenantId: string) {
    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant && currentUser.value?.tenantIds.includes(tenantId)) {
      currentTenant.value = tenant
    }
  }

  function logout() {
    currentUser.value = null
    currentTenant.value = null
  }

  function getDemoUsers(): User[] {
    return users
  }

  return {
    currentUser,
    currentTenant,
    isAuthenticated,
    hasTenantSelected,
    availableTenants,
    login,
    selectTenant,
    logout,
    getDemoUsers,
  }
})
