<!-- FormReset.vue -->
<template>
  <button type="reset">
    <slot>reset</slot>
  </button>
</template>

<script lang="ts" setup>
import { useFormContextOrThrow } from "./Form.context";

useFormContextOrThrow();
</script>
