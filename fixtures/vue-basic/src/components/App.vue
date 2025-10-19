<template>
  <div>{{ $t('greet.hello') }}</div>
  <div>{{ $t(`errors.${code}`) }}</div>
  <!-- unused: exists only in dicts -->
</template>

<script setup lang="ts">
const code = 'not_found'
// a direct literal missing in dictionaries
const x = t('missing.key')
</script>


