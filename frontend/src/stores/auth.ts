import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Tenant } from '@/types'
import { apiLogin, apiGetMe, apiGetTenants, setToken, clearToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const currentTenant = ref<Tenant | null>(null)
  const allTenants = ref<Tenant[]>([])
  const isAuthenticated = computed(() => currentUser.value !== null)
  const hasTenantSelected = computed(() => currentTenant.value !== null)

  const availableTenants = computed(() => {
    if (!currentUser.value) return []
    return allTenants.value.filter((t) => currentUser.value!.tenantIds.includes(t.id))
  })

  const isBuchhalter = computed(() => {
    const role = currentUser.value?.role
    return role === 'Buchhalter' || role === 'Hauptbuchhalter'
  })

  function autoSelectTenant() {
    if (!currentUser.value) return
    const userTenants = allTenants.value.filter((t) => currentUser.value!.tenantIds.includes(t.id))
    // Buchhalter: always auto-select first tenant so sidebar works
    // Normal users: only auto-select if exactly one tenant
    if (isBuchhalter.value && userTenants.length > 0) {
      currentTenant.value = userTenants[0]
    } else if (userTenants.length === 1) {
      currentTenant.value = userTenants[0]
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      const result = await apiLogin(email, password)
      setToken(result.token)
      currentUser.value = result.user as User

      const tenants = await apiGetTenants()
      allTenants.value = tenants as Tenant[]

      autoSelectTenant()
      return true
    } catch {
      return false
    }
  }

  async function restoreSession(): Promise<boolean> {
    try {
      const user = await apiGetMe()
      currentUser.value = user as User
      const tenants = await apiGetTenants()
      allTenants.value = tenants as Tenant[]
      autoSelectTenant()
      return true
    } catch {
      clearToken()
      return false
    }
  }

  function selectTenant(tenantId: string) {
    const tenant = allTenants.value.find((t) => t.id === tenantId)
    if (tenant && currentUser.value?.tenantIds.includes(tenantId)) {
      currentTenant.value = tenant
    }
  }

  function logout() {
    currentUser.value = null
    currentTenant.value = null
    allTenants.value = []
    clearToken()
  }

  return {
    currentUser,
    currentTenant,
    allTenants,
    isAuthenticated,
    hasTenantSelected,
    isBuchhalter,
    availableTenants,
    login,
    restoreSession,
    selectTenant,
    logout,
  }
})
