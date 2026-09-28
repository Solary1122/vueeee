<script setup>
const { data: baseHtml } = await useFetch('/api/base-template');
</script>

<template>
  <div>
    <Dashboard :base-html="baseHtml || ''" />
  </div>
</template>
