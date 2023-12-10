<!-- Form.vue -->
<template>
  <form @submit.prevent="submit" @reset.prevent="reset">
    {{ initialFields }}
    <hr />
    {{ fields }}
    <slot></slot>

    {{ shouldLiveValidate }}
  </form>
</template>

<script setup lang="ts">
import { createFormContext } from "./Form.context";

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  validation: {
    type: Object,
    required: false,
  },
});

const emits = defineEmits(["submit"]);

const { initialFields, fields, submit, reset, shouldLiveValidate } =
  createFormContext({
    props,
    emits,
  });

defineExpose({
  submit,
  reset,
});
</script>
