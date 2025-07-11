<template>
  <BaseLayout :show-footer="showFooter">
    <div class="px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from "./BaseLayout.vue";

interface Props {
  showFooter?: boolean;
}

withDefaults(defineProps<Props>(), {
  showFooter: false,
});
</script>
