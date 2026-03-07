<script setup lang="ts">
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__card">
      <div class="auth-layout__logo">
        <img src="@/assets/logo.png" alt="Count" class="auth-layout__logo-img" />
        <span class="auth-layout__logo-text">Count</span>
      </div>
      <p class="auth-layout__subtitle">Buchhaltung. Einfach. Schweiz.</p>
      <slot />
    </div>
    <div class="auth-layout__footer">
      <span class="auth-layout__trust">🇨🇭 Datenhaltung Schweiz</span>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0B3D91 0%, #1a5cc8 50%, #0B3D91 100%);
  padding: 2rem;
}

.auth-layout__card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-layout__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.auth-layout__logo-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.auth-layout__logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: #0B3D91;
}

.auth-layout__subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.auth-layout__footer {
  margin-top: 2rem;
}

.auth-layout__trust {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .auth-layout {
    padding: 1rem;
  }

  .auth-layout__card {
    padding: 1.5rem;
  }
}
</style>
