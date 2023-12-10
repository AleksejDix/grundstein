import { ref, computed, watch } from "vue";
import { useFormContextOrThrow } from "./Form.context";

let id = 0;

export function useField({ props }: any) {
  id++;
  const shouldLiveFieldValidate = ref(false);

  const { fields, errors, validateField, shouldLiveValidate } =
    useFormContextOrThrow();

  const messages = computed(
    () => errors.value?.[props.name as keyof typeof errors]
  );

  const name = ref(props.name);

  const helpId = "help" + id;
  const labelId = "label" + id;
  const inputId = "input" + id;

  const value = computed({
    get() {
      return fields.value[name.value as keyof typeof fields.value];
    },
    set(value) {
      fields.value[name.value as keyof typeof fields.value] = value;
    },
  });

  const validate = () => {
    shouldLiveFieldValidate.value = true;
    validateField(props.name);
  };

  watch(value, () => {
    if (shouldLiveValidate.value || shouldLiveFieldValidate.value) {
      validate();
    }
  });

  return {
    name,
    helpId,
    labelId,
    inputId,
    value,
    messages,
    shouldLiveFieldValidate,
    validate,
  };
}
