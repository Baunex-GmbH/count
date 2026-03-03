<script setup lang="ts">
</script>

<template>
  <div class="trust-badge">
    <div class="trust-badge__icon">🇨🇭</div>
    <div class="trust-badge__text">
      <span class="trust-badge__title">Datenhaltung Schweiz</span>
      <span class="trust-badge__detail">Hosting: Exoscale (CH) · Verschlüsselung: AES-256</span>
    </div>
  </div>
</template>

<style scoped>
.trust-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f0f4ff;
  border: 1px solid #c7d7f5;
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.trust-badge__icon {
  font-size: 1.5rem;
}

.trust-badge__text {
  display: flex;
  flex-direction: column;
}

.trust-badge__title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0B3D91;
}

.trust-badge__detail {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
