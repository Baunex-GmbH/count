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
    name: 'Basis',
    preis: 29,
    description: 'Für Unternehmer, die Belege sichern und ihrem Buchhalter übergeben wollen.',
    features: [
      'Unbegrenzte Belege hochladen',
      'Datenexport (CSV, DATEV)',
      'Buchhalter-Zugang einladen',
      'Dashboard & Übersicht',
      'Sichere Datenhaltung Schweiz',
      'E-Mail-Support',
    ],
    highlighted: false,
  },
  {
    name: 'Smart',
    preis: 39,
    description: 'Für Unternehmer, die Buchhaltungskosten senken wollen.',
    features: [
      'Alles aus Basis',
      'Automatische Texterkennung (OCR)',
      'KI-gestützte Verbuchung',
      'Weniger Aufwand für Ihren Buchhalter',
      'Kontenrahmen-Verwaltung',
      'Prioritäts-Support',
    ],
    highlighted: true,
  },
  {
    name: 'Complete',
    preis: 79,
    preisPrefix: 'ab',
    description: 'Für Unternehmer, die sich nicht um Buchhaltung kümmern wollen.',
    features: [
      'Alles aus Smart',
      'Persönlicher Buchhalter inklusive',
      'Komplette Buchhaltungsführung',
      'MwSt-Abrechnung & Einreichung',
      'Jahresabschluss-Erstellung',
      'Steuererklärung-Vorbereitung',
      'Telefonischer Support',
    ],
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
    <div v-if="activeTab === 'abo'" class="settings__content settings__content--wide">
      <div class="pricing-grid">
        <div
          v-for="(tier, index) in pricingTiers"
          :key="tier.name"
          class="pricing-card"
          :class="[
            tier.highlighted ? 'pricing-card--highlighted' : '',
            auth.currentTenant?.plan === tier.name ? 'pricing-card--current' : '',
            'pricing-card--tier-' + index,
          ]"
        >
          <div class="pricing-card__top" :class="'pricing-card__top--tier-' + index">
            <div class="pricing-card__badges">
              <span v-if="tier.highlighted" class="pricing-card__badge">Beliebteste Wahl</span>
              <span v-if="auth.currentTenant?.plan === tier.name" class="pricing-card__badge pricing-card__badge--current">Ihr Plan</span>
            </div>
            <h3 class="pricing-card__name">{{ tier.name }}</h3>
            <div class="pricing-card__price">
              <span v-if="tier.preisPrefix" class="pricing-card__prefix">{{ tier.preisPrefix }} </span>
              <span class="pricing-card__amount">{{ tier.preis }}</span>
              <div class="pricing-card__price-detail">
                <span class="pricing-card__currency">CHF</span>
                <span class="pricing-card__period">/ Monat</span>
              </div>
            </div>
          </div>
          <p class="pricing-card__description">{{ tier.description }}</p>
          <div class="pricing-card__divider"></div>
          <ul class="pricing-card__features">
            <li v-for="feature in tier.features" :key="feature">
              <i class="pi pi-check-circle"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>
          <button
            class="pricing-card__btn"
            :class="auth.currentTenant?.plan === tier.name ? 'pricing-card__btn--current' : tier.highlighted ? 'pricing-card__btn--primary' : 'pricing-card__btn--outline'"
            @click="selectPlan(tier)"
          >
            {{ auth.currentTenant?.plan === tier.name ? 'Aktueller Plan' : 'Plan wählen' }}
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
  gap: 1.25rem;
  align-items: start;
}

.pricing-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.pricing-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.pricing-card--highlighted {
  border-color: #0B3D91;
  box-shadow: 0 8px 30px rgba(11, 61, 145, 0.15);
  transform: scale(1.03);
}

.pricing-card--highlighted:hover {
  transform: scale(1.03) translateY(-2px);
}

.pricing-card--current {
  border-color: #10b981;
}

/* Colored top section */
.pricing-card__top {
  padding: 1.5rem 1.5rem 1.25rem;
  color: white;
}

.pricing-card__top--tier-0 {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.pricing-card__top--tier-1 {
  background: linear-gradient(135deg, #0B3D91 0%, #1a5cc8 100%);
}

.pricing-card__top--tier-2 {
  background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
}

.pricing-card__badges {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  min-height: 22px;
}

.pricing-card__badge {
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  backdrop-filter: blur(4px);
}

.pricing-card__badge--current {
  background: #10b981;
}

.pricing-card__name {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.pricing-card__price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.pricing-card__prefix {
  font-size: 0.85rem;
  font-weight: 400;
  opacity: 0.8;
}

.pricing-card__amount {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
}

.pricing-card__price-detail {
  display: flex;
  flex-direction: column;
  margin-left: 0.15rem;
}

.pricing-card__currency {
  font-size: 0.8rem;
  font-weight: 600;
  opacity: 0.9;
}

.pricing-card__period {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Card body */
.pricing-card__description {
  padding: 1.25rem 1.5rem 0;
  font-size: 0.84rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.pricing-card__divider {
  height: 1px;
  background: #e5e7eb;
  margin: 1rem 1.5rem;
}

.pricing-card__features {
  list-style: none;
  padding: 0 1.5rem;
  margin: 0 0 1.5rem;
  flex: 1;
}

.pricing-card__features li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.35rem 0;
  font-size: 0.85rem;
  color: #374151;
}

.pricing-card__features li i {
  font-size: 0.8rem;
  margin-top: 0.15rem;
  flex-shrink: 0;
}

.pricing-card--tier-0 .pricing-card__features li i { color: #6b7280; }
.pricing-card--tier-1 .pricing-card__features li i { color: #0B3D91; }
.pricing-card--tier-2 .pricing-card__features li i { color: #7c3aed; }

/* Buttons */
.pricing-card__btn {
  margin: 0 1.5rem 1.5rem;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-align: center;
  transition: all 0.15s;
}

.pricing-card__btn--outline {
  background: white;
  border: 2px solid #d1d5db;
  color: #4b5563;
}

.pricing-card__btn--outline:hover {
  border-color: #6b7280;
  color: #1f2937;
}

.pricing-card__btn--primary {
  background: #0B3D91;
  color: white;
}

.pricing-card__btn--primary:hover {
  background: #092f73;
}

.pricing-card__btn--current {
  background: #f0fdf4;
  color: #047857;
  border: 2px solid #10b981;
  cursor: default;
}

/* Plan badge */
.plan-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  white-space: nowrap;
}

.plan-badge--basis { background: #e5e7eb; color: #4b5563; }
.plan-badge--smart { background: #dbeafe; color: #1d4ed8; }
.plan-badge--complete { background: #fef3c7; color: #b45309; }

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
    gap: 1rem;
  }

  .pricing-card--highlighted {
    transform: none;
  }

  .pricing-card--highlighted:hover {
    transform: translateY(-2px);
  }

  .pricing-card__amount {
    font-size: 2rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .api-key-row {
    flex-direction: column;
  }
}
</style>
