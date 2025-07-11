<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div
          :class="[
            'w-8 h-8 rounded-lg flex items-center justify-center',
            iconBgColor,
          ]"
        >
          <svg
            :class="['w-5 h-5', iconColor]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              :d="iconPath"
              :fill-rule="iconFillRule"
              :clip-rule="iconClipRule"
            />
          </svg>
        </div>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-500">{{ label }}</p>
        <p class="text-2xl font-bold text-gray-900">{{ value }}</p>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  subtitle?: string;
  iconPath: string;
  iconBgColor?: string;
  iconColor?: string;
  iconFillRule?: string;
  iconClipRule?: string;
}

withDefaults(defineProps<Props>(), {
  iconBgColor: "bg-blue-100",
  iconColor: "text-blue-600",
  iconFillRule: "nonzero",
  iconClipRule: "evenodd",
});
</script>
