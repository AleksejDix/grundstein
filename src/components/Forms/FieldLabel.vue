<template>
  <label :id="labelId" :for="inputId" class="block"><slot></slot></label>
</template>

<script setup lang="ts">
import { useFieldContextOrThrow } from "./Field.context";

const { inputId, labelId } = useFieldContextOrThrow();
</script>
