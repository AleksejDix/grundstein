<template>
  <div v-for="(errorMessages, fieldName) in errors" :key="fieldName">
    <a :href="`#${fieldName}`">{{ fieldName }}</a>
    <ul>
      <li v-for="error in errorMessages" :key="error">
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useFormContextOrThrow } from "./Form.context";

const { errors } = useFormContextOrThrow();
</script>
