<!-- FieldInput -->
<template>
  <input
    :id="inputId"
    v-model="model"
    :name="name"
    :type="type"
    :aria-labelledby="`${(labelId, helpId)}`"
    @blur="validate"
  />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useFieldContextOrThrow } from "./Field.context";

const props = defineProps({
  modelValue: {
    type: [Boolean, String, Array, Object],
    default: undefined,
  },
  type: {
    type: String,
    required: true,
    default: "text",
  },
});

const emit = defineEmits(["update:modelValue"]);

const { name, helpId, inputId, labelId, value, validate } =
  useFieldContextOrThrow();

const model = computed({
  get() {
    return props.modelValue || value.value;
  },
  set(payload: string) {
    value.value = payload;
    emit("update:modelValue", payload);
  },
});
</script>
