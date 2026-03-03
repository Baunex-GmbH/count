<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const selectedEmail = ref('')
const password = ref('demo')
const errorMsg = ref('')
const demoUsers = auth.getDemoUsers()

function handleLogin() {
  errorMsg.value = ''
  if (!selectedEmail.value) {
    errorMsg.value = 'Bitte wählen Sie einen Benutzer aus.'
    return
  }
  const success = auth.login(selectedEmail.value, password.value)
  if (success) {
    if (auth.hasTenantSelected) {
      router.push('/')
    } else {
      router.push('/tenant-select')
    }
  } else {
    errorMsg.value = 'Login fehlgeschlagen.'
  }
}
</script>

<template>
  <div>
    <h2 class="login__title">Anmelden</h2>

    <div class="login__demo-hint">
      <i class="pi pi-info-circle"></i>
      Demo-Modus: Wählen Sie einen Benutzer, Passwort beliebig.
    </div>

    <form @submit.prevent="handleLogin" class="login__form">
      <div class="form-group">
        <label class="form-label">Benutzer</label>
        <select v-model="selectedEmail" class="form-select">
          <option value="" disabled>Benutzer auswählen...</option>
          <option v-for="user in demoUsers" :key="user.id" :value="user.email">
            {{ user.name }} ({{ user.role }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Passwort</label>
        <input v-model="password" type="password" class="form-input" placeholder="Beliebiges Passwort" />
      </div>

      <div v-if="errorMsg" class="login__error">{{ errorMsg }}</div>

      <button type="submit" class="login__btn">
        <i class="pi pi-sign-in"></i> Anmelden
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
</style>
