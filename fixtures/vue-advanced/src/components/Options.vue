<template>
  <div>{{ this.$t('Utilities.stepperForm.weekly') }}</div>
  <ul>
    <li v-for="tf in timeFramesAvailables" :key="tf.id">{{ tf.name }}</li>
  </ul>
  <div>{{ this.$t('Utilities.stepperForm.monthly') }}</div>
  <div>{{ this.$t('Utilities.stepperForm.twoWeeks') }}</div>
</template>

<script>
export default {
  name: 'Options',
  data() {
    return {
      timeFramesAvailables: [
        { id: 'WEEKLY', name: this.$t('Utilities.stepperForm.weekly') },
        { id: 'MONTHLY', name: this.$t('Utilities.stepperForm.monthly') },
        { id: 'TWO_WEEKS', name: this.$t('Utilities.stepperForm.twoWeeks') },
      ],
    }
  },
}
</script>


