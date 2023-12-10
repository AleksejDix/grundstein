import { createInjectionState } from "@vueuse/shared";
import { useField } from "./Field.use";

const [createFieldContext, useFieldContext] = createInjectionState(useField);
export { createFieldContext };
export { useFieldContext };

export function useFieldContextOrThrow() {
  const counterStore = useFieldContext();
  if (counterStore == null)
    throw new Error(
      "Please call `createFieldContext` on the appropriate parent component"
    );
  return counterStore;
}
