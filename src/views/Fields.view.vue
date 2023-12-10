<template>
  <Form v-model="form" :validation="schema" @submit="handleSubmit">
    <FormErrors></FormErrors>

    <Field name="username">
      <FieldLabel>email:</FieldLabel>
      <FieldInput type="email" autocomplete="username"></FieldInput>
      <FieldError></FieldError>
    </Field>

    <Field name="password">
      <FieldLabel>password:</FieldLabel>
      <FieldInput type="password" autcomplete="current-password"></FieldInput>
      <FieldError></FieldError>
    </Field>

    <div class="flex justify-end gap-[2px]">
      <FormReset></FormReset>
      <FormSubmit></FormSubmit>
    </div>
  </Form>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { z } from "zod";

import {
  Form,
  FormErrors,
  FormSubmit,
  FormReset,
  Field,
  FieldLabel,
  FieldHelp,
  FieldInput,
  FieldError,
} from "@/components/Forms";

const form = reactive({});

const schema = z.object({
  username: z.string().min(1, "Password is required").email(),
  password: z
    .string()
    .min(1, "Password is required")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^a-zA-Z0-9]/,
      "Password must contain at least one special character"
    ),
});

const handleSubmit = (payload: any) => {
  console.log(payload);
};
</script>
