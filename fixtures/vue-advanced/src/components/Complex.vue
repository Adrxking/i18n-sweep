<template>
  <!-- literales existentes -->
  <h1>{{ $t('menu.home') }}</h1>
  <!-- literales missing -->
  <h2>{{ $t('menu.admin') }}</h2>
  <!-- template literal dinámico: debe generar prefix menu. y NO marcar unused de ese prefijo -->
  <p>{{ $t(`menu.${active}`) }}</p>
  <!-- concatenación dinámica: form. + field -->
  <label>{{ $t('form.' + field) }}</label>
  <!-- options api this.$t literal -->
  <span>{{ this.$t('notifications.new') }}</span>
</template>

<script setup lang="ts">
const active = 'home'
const field = 'email'
</script>


