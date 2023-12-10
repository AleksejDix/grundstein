<template>
  <div :id="helpId" class="block">
    <slot>Please add some help text</slot>
  </div>
</template>

<script lang="ts" setup>
import { useFieldContext } from "./Field.context";

const { helpId } = useFieldContext();
</script>
