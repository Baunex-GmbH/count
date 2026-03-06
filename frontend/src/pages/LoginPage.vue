<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('count123')
const errorMsg = ref('')
const isLoading = ref(false)

const demoAccounts = [
  { email: 'emre.oezbek@count.ch', name: 'Emre Özbek', role: 'Hauptbuchhalter', initials: 'EÖ' },
  { email: 'sandra.hofer@treuhand-hofer.ch', name: 'Sandra Hofer', role: 'Buchhalter', initials: 'SH' },
  { email: 'thomas.hofer@schreinerei-hofer.ch', name: 'Thomas Hofer', role: 'User', initials: 'TH' },
  { email: 'patrizia.lang@gastro-seeland.ch', name: 'Patrizia Lang', role: 'User', initials: 'PL' },
  { email: 'beat.buehler@elektro-buehler.ch', name: 'Beat Bühler', role: 'User', initials: 'BB' },
]

function selectDemoAccount(account: typeof demoAccounts[0]) {
  email.value = account.email
  password.value = 'count123'
  handleLogin()
}

async function handleLogin() {
  errorMsg.value = ''
  if (!email.value) {
    errorMsg.value = 'Bitte geben Sie Ihre E-Mail ein.'
    return
  }
  isLoading.value = true
  const success = await auth.login(email.value, password.value)
  isLoading.value = false
  if (success) {
    if (auth.isBuchhalter) {
      router.push('/mandanten')
    } else if (auth.hasTenantSelected) {
      router.push('/')
    } else {
      router.push('/tenant-select')
    }
  } else {
    errorMsg.value = 'Login fehlgeschlagen. Prüfen Sie E-Mail und Passwort.'
  }
}
</script>

<template>
  <div>
    <h2 class="login__title">Anmelden</h2>

    <div class="login__demo-hint">
      <i class="pi pi-info-circle"></i>
      Demo-Modus – Passwort: <strong>count123</strong>
    </div>

    <div class="demo-accounts">
      <p class="demo-accounts__title">Schnellzugang</p>
      <button
        v-for="account in demoAccounts"
        :key="account.email"
        class="demo-account"
        @click="selectDemoAccount(account)"
        :disabled="isLoading"
      >
        <span class="demo-account__avatar">{{ account.initials }}</span>
        <span class="demo-account__info">
          <span class="demo-account__name">{{ account.name }}</span>
          <span class="demo-account__role">{{ account.role }}</span>
        </span>
        <i class="pi pi-sign-in demo-account__arrow"></i>
      </button>
    </div>

    <div class="login__divider">
      <span>oder manuell</span>
    </div>

    <form @submit.prevent="handleLogin" class="login__form">
      <div class="form-group">
        <label class="form-label">E-Mail</label>
        <input v-model="email" type="email" class="form-input" placeholder="E-Mail Adresse" autocomplete="email" />
      </div>

      <div class="form-group">
        <label class="form-label">Passwort</label>
        <input v-model="password" type="password" class="form-input" placeholder="Passwort" autocomplete="current-password" />
      </div>

      <div v-if="errorMsg" class="login__error">{{ errorMsg }}</div>

      <button type="submit" class="login__btn" :disabled="isLoading">
        <i class="pi pi-sign-in"></i> {{ isLoading ? 'Anmelden...' : 'Anmelden' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.login__title {
  text-align: center;
  color: #1f2937;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.login__demo-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
  padding: 0.6rem 0.75rem;
  border-radius: 6px;
  font-size: 0.82rem;
  margin-bottom: 1.5rem;
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
}

.form-select,
.form-input {
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1f2937;
  background: white;
  outline: none;
  transition: border-color 0.15s;
}

.form-select:focus,
.form-input:focus {
  border-color: #0B3D91;
  box-shadow: 0 0 0 3px rgba(11, 61, 145, 0.1);
}

.login__error {
  color: #dc2626;
  font-size: 0.85rem;
  text-align: center;
}

.login__btn {
  background: #0B3D91;
  color: white;
  border: none;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.15s;
}

.login__btn:hover {
  background: #092f73;
}

.demo-accounts {
  margin-bottom: 1.25rem;
}

.demo-accounts__title {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 0.5rem;
}

.demo-account {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.55rem 0.65rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
  margin-bottom: 0.4rem;
}

.demo-account:last-of-type {
  margin-bottom: 0;
}

.demo-account:hover {
  border-color: #0B3D91;
  background: #f0f4fa;
}

.demo-account:disabled {
  opacity: 0.5;
  cursor: wait;
}

.demo-account__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0B3D91;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  flex-shrink: 0;
}

.demo-account__info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.demo-account__name {
  font-size: 0.88rem;
  font-weight: 500;
  color: #1f2937;
}

.demo-account__role {
  font-size: 0.75rem;
  color: #6b7280;
}

.demo-account__arrow {
  color: #9ca3af;
  font-size: 0.85rem;
}

.demo-account:hover .demo-account__arrow {
  color: #0B3D91;
}

.login__divider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  color: #9ca3af;
  font-size: 0.8rem;
}

.login__divider::before,
.login__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
</style>
