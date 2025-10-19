<template>
  <div>{{ $t('greet.hello') }}</div>
  <div>{{ $t('greet.welcome', { name }) }}</div>
  <div>{{ $t(`errors.${code}`) }}</div>
  <div>{{ i18n.t('errors.required') }}</div>
  <div>{{ this.$t('opt.hello') }}</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const name = 'Ada'
const code = 'not_found'
const missing = t('missing.literal')
const concat = t('greet.' + name)
</script>


