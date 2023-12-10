<!-- Field.vue -->
<template>
  <div :id="name" class="bg-gray-100 px-4">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { createFieldContext } from "./Field.context";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

createFieldContext({ props });
</script>
