<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import type { PricingTier } from '@/types'

const auth = useAuthStore()
const notifications = useNotificationStore()
const activeTab = ref<'abo' | 'profil' | 'unternehmen'>('abo')

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    preis: 29,
    features: [
      'Bis 50 Belege/Monat',
      '1 Benutzer',
      'OCR-Erkennung',
      'E-Mail-Support',
    ],
    highlighted: false,
  },
  {
    name: 'Professional',
    preis: 79,
    features: [
      'Bis 500 Belege/Monat',
      '5 Benutzer',
      'OCR-Erkennung + KI',
      'DATEV-Export',
      'Prioritäts-Support',
      'Buchhaltungs-Modul',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    preis: 199,
    features: [
      'Unbegrenzte Belege',
      'Unbegrenzte Benutzer',
      'OCR-Erkennung + KI',
      'DATEV + BMD Export',
      'Dedizierter Support',
      'API-Zugang',
      'Custom Kontenrahmen',
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
</script>

<template>
  <div class="settings">
    <div class="settings__header">
      <h1>Einstellungen</h1>
    </div>

    <div class="settings__tabs">
      <button class="tab" :class="{ 'tab--active': activeTab === 'abo' }" @click="activeTab = 'abo'">Abonnement</button>
      <button class="tab" :class="{ 'tab--active': activeTab === 'profil' }" @click="activeTab = 'profil'">Profil</button>
      <button class="tab" :class="{ 'tab--active': activeTab === 'unternehmen' }" @click="activeTab = 'unternehmen'">Unternehmen</button>
    </div>

    <!-- Abonnement Tab -->
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

    <!-- Profil Tab -->
    <div v-if="activeTab === 'profil'" class="settings__content">
      <div class="card">
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
          <p class="form-hint">Profilbearbeitung ist in der Demo nicht verfügbar.</p>
        </div>
      </div>
    </div>

    <!-- Unternehmen Tab -->
    <div v-if="activeTab === 'unternehmen'" class="settings__content">
      <div class="card">
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
          <p class="form-hint">Unternehmenseinstellungen können in der Demo nicht geändert werden.</p>
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
  max-width: 900px;
}

.settings__info {
  margin-bottom: 1.25rem;
  color: #4b5563;
  font-size: 0.9rem;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 768px) {
  .pricing-grid { grid-template-columns: 1fr; }
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

.card {
  background: white;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.card__body {
  padding: 1.5rem;
}

.form-row {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 0.3rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1f2937;
  background: #f9fafb;
}

.form-hint {
  font-size: 0.82rem;
  color: #9ca3af;
  font-style: italic;
}

.btn {
  padding: 0.55rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  width: 100%;
  text-align: center;
}

.btn--primary { background: #0B3D91; color: white; }
.btn--secondary { background: #f3f4f6; color: #4b5563; }
.btn--outline { background: white; border: 1px solid #e5e7eb; color: #4b5563; }
</style>
