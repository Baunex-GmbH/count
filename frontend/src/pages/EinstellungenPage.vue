<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import type { PricingTier } from '@/types'

const auth = useAuthStore()
const notifications = useNotificationStore()

const isBuchhalter = computed(() => {
  const role = auth.currentUser?.role
  return role === 'Buchhalter' || role === 'Hauptbuchhalter'
})

type TabKey = 'abo' | 'profil' | 'unternehmen' | 'mandanten-verwalten' | 'system'

const activeTab = ref<TabKey>(isBuchhalter.value ? 'profil' : 'abo')

const tabs = computed(() => {
  if (isBuchhalter.value) {
    return [
      { key: 'profil' as TabKey, label: 'Profil', icon: 'pi pi-user' },
      { key: 'mandanten-verwalten' as TabKey, label: 'Mandanten verwalten', icon: 'pi pi-building' },
      { key: 'system' as TabKey, label: 'System', icon: 'pi pi-cog' },
    ]
  }
  return [
    { key: 'abo' as TabKey, label: 'Abonnement', icon: 'pi pi-credit-card' },
    { key: 'profil' as TabKey, label: 'Profil', icon: 'pi pi-user' },
    { key: 'unternehmen' as TabKey, label: 'Unternehmen', icon: 'pi pi-building' },
  ]
})

// Pricing
const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    preis: 29,
    features: ['Bis 50 Belege/Monat', '1 Benutzer', 'OCR-Erkennung', 'E-Mail-Support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    preis: 79,
    features: ['Bis 500 Belege/Monat', '5 Benutzer', 'OCR-Erkennung + KI', 'DATEV-Export', 'Prioritäts-Support', 'Buchhaltungs-Modul'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    preis: 199,
    features: ['Unbegrenzte Belege', 'Unbegrenzte Benutzer', 'OCR-Erkennung + KI', 'DATEV + BMD Export', 'Dedizierter Support', 'API-Zugang', 'Custom Kontenrahmen'],
    highlighted: false,
  },
]

function selectPlan(tier: PricingTier) {
  if (auth.currentTenant?.plan === tier.name) {
    notifications.info('Aktueller Plan', `Sie nutzen bereits "${tier.name}"`)
    return
  }
  notifications.success('Plan gewechselt', `Upgrade auf "${tier.name}" erfolgreich (simuliert)`)
}

// System settings
const exportFormat = ref('DATEV')
const kontenrahmen = ref('KMU')
const apiKeyVisible = ref(false)
const demoApiKey = 'ck_live_7f3a2b9e4d1c8f5a6b7e3d2c1a9f8e7d'

function regenerateApiKey() {
  notifications.success('API-Key erneuert', 'Neuer API-Key wurde generiert (simuliert)')
}

function saveSystemSettings() {
  notifications.success('Gespeichert', 'Systemeinstellungen wurden aktualisiert (simuliert)')
}
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1>Einstellungen</h1>
    </div>

    <div class="settings__tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ 'tab--active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Abonnement Tab (User only) -->
    <div v-if="activeTab === 'abo'" class="settings__content">
      <p class="settings__info">
        Aktueller Plan: <strong>{{ auth.currentTenant?.plan }}</strong>
      </p>
      <div class="pricing-grid">
        <div
          v-for="tier in pricingTiers"
          :key="tier.name"
          class="pricing-card"
          :class="{ 'pricing-card--highlighted': tier.highlighted, 'pricing-card--current': auth.currentTenant?.plan === tier.name }"
        >
          <div v-if="tier.highlighted" class="pricing-card__badge">Empfohlen</div>
          <div v-if="auth.currentTenant?.plan === tier.name" class="pricing-card__badge pricing-card__badge--current">Aktuell</div>
          <h3 class="pricing-card__name">{{ tier.name }}</h3>
          <div class="pricing-card__price">
            <span class="pricing-card__amount">CHF {{ tier.preis }}</span>
            <span class="pricing-card__period">/ Monat</span>
          </div>
          <ul class="pricing-card__features">
            <li v-for="feature in tier.features" :key="feature">
              <i class="pi pi-check"></i> {{ feature }}
            </li>
          </ul>
          <button
            class="btn"
            :class="auth.currentTenant?.plan === tier.name ? 'btn--secondary' : tier.highlighted ? 'btn--primary' : 'btn--outline'"
            @click="selectPlan(tier)"
          >
            {{ auth.currentTenant?.plan === tier.name ? 'Aktueller Plan' : 'Auswählen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Profil Tab (both) -->
    <div v-if="activeTab === 'profil'" class="settings__content">
      <div class="card">
        <div class="card__header">
          <h3><i class="pi pi-user"></i> Mein Profil</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <label class="form-label">Name</label>
            <input class="form-input" :value="auth.currentUser?.name" readonly />
          </div>
          <div class="form-row">
            <label class="form-label">E-Mail</label>
            <input class="form-input" :value="auth.currentUser?.email" readonly />
          </div>
          <div class="form-row">
            <label class="form-label">Rolle</label>
            <input class="form-input" :value="auth.currentUser?.role" readonly />
          </div>
          <div v-if="isBuchhalter" class="form-row">
            <label class="form-label">Zugewiesene Mandanten</label>
            <input class="form-input" :value="auth.availableTenants.map(t => t.name).join(', ')" readonly />
          </div>
          <p class="form-hint">Profilbearbeitung ist in der Demo nicht verfügbar.</p>
        </div>
      </div>
    </div>

    <!-- Unternehmen Tab (User only) -->
    <div v-if="activeTab === 'unternehmen'" class="settings__content">
      <div class="card">
        <div class="card__header">
          <h3><i class="pi pi-building"></i> Unternehmen</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <label class="form-label">Firma</label>
            <input class="form-input" :value="auth.currentTenant?.name" readonly />
          </div>
          <div class="form-row">
            <label class="form-label">Adresse</label>
            <input class="form-input" :value="auth.currentTenant?.address" readonly />
          </div>
          <div class="form-row">
            <label class="form-label">UID-Nummer</label>
            <input class="form-input" :value="auth.currentTenant?.uid" readonly style="font-family: monospace" />
          </div>
          <div class="form-row">
            <label class="form-label">Abo</label>
            <input class="form-input" :value="auth.currentTenant?.plan" readonly />
          </div>
          <p class="form-hint">Unternehmenseinstellungen können in der Demo nicht geändert werden.</p>
        </div>
      </div>
    </div>

    <!-- Mandanten verwalten Tab (Buchhalter only) -->
    <div v-if="activeTab === 'mandanten-verwalten'" class="settings__content settings__content--wide">
      <p class="settings__info">
        Stammdaten Ihrer {{ auth.availableTenants.length }} Mandanten verwalten
      </p>
      <div class="mandant-settings-grid">
        <div v-for="tenant in auth.availableTenants" :key="tenant.id" class="card">
          <div class="card__header">
            <h3>
              <i class="pi pi-building"></i> {{ tenant.name }}
            </h3>
            <span class="plan-badge" :class="'plan-badge--' + tenant.plan.toLowerCase()">{{ tenant.plan }}</span>
          </div>
          <div class="card__body">
            <div class="form-grid">
              <div class="form-row">
                <label class="form-label">Firma</label>
                <input class="form-input" :value="tenant.name" readonly />
              </div>
              <div class="form-row">
                <label class="form-label">Adresse</label>
                <input class="form-input" :value="tenant.address" readonly />
              </div>
              <div class="form-row">
                <label class="form-label">UID-Nummer</label>
                <input class="form-input" :value="tenant.uid" readonly style="font-family: monospace" />
              </div>
              <div class="form-row">
                <label class="form-label">Abo-Plan</label>
                <input class="form-input" :value="tenant.plan" readonly />
              </div>
            </div>
            <p class="form-hint">Bearbeitung in der Demo nicht verfügbar.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- System Tab (Buchhalter only) -->
    <div v-if="activeTab === 'system'" class="settings__content">
      <!-- Export -->
      <div class="card">
        <div class="card__header">
          <h3><i class="pi pi-download"></i> Export-Einstellungen</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <label class="form-label">Standard Export-Format</label>
            <select v-model="exportFormat" class="form-input">
              <option value="DATEV">DATEV</option>
              <option value="CSV">CSV</option>
              <option value="BMD">BMD</option>
              <option value="Abacus">Abacus</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">Kontenrahmen</label>
            <select v-model="kontenrahmen" class="form-input">
              <option value="KMU">Schweizer KMU Kontenrahmen</option>
              <option value="KMU-erweitert">KMU Erweitert</option>
              <option value="OR">Kontenrahmen nach OR</option>
            </select>
          </div>
          <button class="btn btn--primary btn--action" @click="saveSystemSettings">
            <i class="pi pi-check"></i> Speichern
          </button>
        </div>
      </div>

      <!-- API -->
      <div class="card" style="margin-top: 1rem">
        <div class="card__header">
          <h3><i class="pi pi-key"></i> API-Zugang</h3>
        </div>
        <div class="card__body">
          <div class="form-row">
            <label class="form-label">API-Key</label>
            <div class="api-key-row">
              <input
                class="form-input form-input--mono"
                :value="apiKeyVisible ? demoApiKey : '••••••••••••••••••••••••••••••'"
                readonly
              />
              <button class="btn btn--outline btn--icon" @click="apiKeyVisible = !apiKeyVisible" :title="apiKeyVisible ? 'Verbergen' : 'Anzeigen'">
                <i :class="apiKeyVisible ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
              </button>
            </div>
          </div>
          <div class="form-row">
            <label class="form-label">API-Endpoint</label>
            <input class="form-input form-input--mono" value="https://count.baunex.ch/api" readonly />
          </div>
          <button class="btn btn--outline btn--action" @click="regenerateApiKey">
            <i class="pi pi-refresh"></i> Neuen Key generieren
          </button>
          <p class="form-hint" style="margin-top: 0.75rem">
            API-Dokumentation ist in der Demo nicht verfügbar.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings__header {
  margin-bottom: 1.25rem;
}

.settings__header h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.settings__tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab {
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.15s;
}

.tab:hover {
  color: #0B3D91;
}

.tab--active {
  color: #0B3D91;
  font-weight: 600;
  border-bottom-color: #0B3D91;
}

.settings__content {
  max-width: 600px;
}

.settings__content--wide {
  max-width: 900px;
}

.settings__info {
  margin-bottom: 1.25rem;
  color: #4b5563;
  font-size: 0.9rem;
}

/* Card */
.card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.card__header h3 {
  margin: 0;
  font-size: 0.95rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card__body {
  padding: 1.25rem;
}

/* Form */
.form-row {
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 1rem;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.3rem;
}

.form-input {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.88rem;
  color: #1f2937;
  background: #f9fafb;
  font-family: inherit;
}

.form-input:not([readonly]):focus {
  outline: none;
  border-color: #0B3D91;
  box-shadow: 0 0 0 3px rgba(11, 61, 145, 0.1);
  background: white;
}

.form-input--mono {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.82rem;
}

.form-hint {
  font-size: 0.82rem;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

/* API key row */
.api-key-row {
  display: flex;
  gap: 0.5rem;
}

.api-key-row .form-input {
  flex: 1;
}

/* Pricing */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.pricing-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  position: relative;
}

.pricing-card--highlighted {
  border-color: #0B3D91;
  box-shadow: 0 4px 20px rgba(11, 61, 145, 0.15);
}

.pricing-card--current {
  border-color: #10b981;
}

.pricing-card__badge {
  position: absolute;
  top: -10px;
  right: 16px;
  background: #0B3D91;
  color: white;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
}

.pricing-card__badge--current {
  background: #10b981;
}

.pricing-card__name {
  font-size: 1.1rem;
  color: #1f2937;
  margin: 0 0 0.5rem;
}

.pricing-card__price {
  margin-bottom: 1rem;
}

.pricing-card__amount {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
}

.pricing-card__period {
  font-size: 0.85rem;
  color: #6b7280;
}

.pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
  flex: 1;
}

.pricing-card__features li {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0;
  font-size: 0.85rem;
  color: #4b5563;
}

.pricing-card__features i {
  color: #10b981;
  font-size: 0.75rem;
}

/* Plan badge */
.plan-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.plan-badge--starter { background: #e5e7eb; color: #4b5563; }
.plan-badge--professional { background: #dbeafe; color: #1d4ed8; }
.plan-badge--enterprise { background: #fef3c7; color: #b45309; }

/* Mandant settings grid */
.mandant-settings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Buttons */
.btn {
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: all 0.15s;
}

.btn--action {
  width: auto;
}

.btn--icon {
  width: auto;
  padding: 0.55rem 0.65rem;
}

.btn--primary { background: #0B3D91; color: white; }
.btn--primary:hover { background: #092f73; }
.btn--secondary { background: #f3f4f6; color: #4b5563; }
.btn--outline { background: white; border: 1px solid #e5e7eb; color: #4b5563; }
.btn--outline:hover { border-color: #0B3D91; color: #0B3D91; }

@media (max-width: 768px) {
  .settings__tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab {
    white-space: nowrap;
  }

  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .pricing-card__amount {
    font-size: 1.4rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .api-key-row {
    flex-direction: column;
  }
}
</style>
