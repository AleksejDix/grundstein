<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="onOverlayClick"
  >
    <div
      class="bg-white rounded-xl shadow-xl w-full mx-4 max-w-2xl max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-200"
      >
        <div>
          <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
          <p v-if="subtitle" class="text-sm text-gray-500 mt-1">
            {{ subtitle }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <slot />
      </div>

      <!-- Footer -->
      <div
        v-if="$slots.footer"
        class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200"
      >
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnOverlay: true,
});

const emit = defineEmits<{
  close: [];
}>();

function onOverlayClick() {
  if (props.closeOnOverlay) {
    emit("close");
  }
}
</script>
