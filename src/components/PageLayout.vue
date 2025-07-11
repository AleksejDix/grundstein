<template>
  <DefaultLayout>
    <slot />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { DefaultLayout } from "../layouts";

// NOTE: This component is kept for backward compatibility
// New components should use the layout system directly:
// import { DefaultLayout } from '@/layouts'
</script>
