import { ref, computed, watch } from "vue";
import { syncRef } from "@vueuse/core";

export function useForm({ props, emits }: any) {
  const initialFields = ref({});
  const fields = ref({});
  const shouldLiveValidate = ref(false);

  syncRef(props.modelValue, initialFields, { direction: "ltr" });

  watch(
    props,
    () => {
      fields.value = { ...initialFields.value };
    },
    {
      immediate: true,
    }
  );

  const errors = ref<any>({});

  const reset = () => {
    fields.value = { ...initialFields.value };
  };

  const validate = () => {
    const result = props.validation?.safeParse(fields.value);
    if (!result) return false;
    if (result && !result.success) {
      errors.value = result.error.formErrors.fieldErrors;
      return false;
    } else {
      return true;
    }
  };

  const validateField = (fieldName: string) => {
    const fieldData = {
      [fieldName]: fields.value[fieldName as keyof typeof fields.value],
    };

    const fieldSchema = props.validation?.pick({
      [fieldName]: props.validation?.shape[fieldName],
    });

    const result = fieldSchema.safeParse(fieldData);

    if (result.success) {
      errors.value[fieldName] = undefined;
    } else {
      errors.value[fieldName] = result.error.formErrors.fieldErrors[fieldName];
    }
  };

  function submit() {
    shouldLiveValidate.value = true;
    if (validate()) {
      emits("submit", fields.value);
    }
  }

  return {
    submit,
    fields,
    reset,
    errors: computed(() => errors.value),
    validateField,
    initialFields,
    shouldLiveValidate,
  };
}
