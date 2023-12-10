import { createInjectionState } from "@vueuse/shared";
import { useForm } from "./Form.use";

const [createFormContext, useFormContext] = createInjectionState(useForm);

export { createFormContext };
export { useFormContext };

export function useFormContextOrThrow() {
  const counterStore = useFormContext();
  if (counterStore == null)
    throw new Error(
      "Please call `createFormContext` on the appropriate parent component"
    );
  return counterStore;
}
