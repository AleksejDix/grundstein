<template>
    <div>
        <label for="monthlyReprainment">Monatliche Rate</label>
        <input 
            type="number"
            id="monthlyReprainment" 
            name="monthlyReprainment" 
            :value="modelValue"
            step="1"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="rounded w-full"
        />
        <label for="monthlyReprainmentrange" hidden>monthlyReprainment</label>
        <input
            type="range" 
            id="monthlyReprainmentrange" 
            name="monthlyReprainmentrange"
            min="0"
            step="1"
            max="2000"
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="w-full h-1 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer">
    </div>
</template>

<script setup lang="ts">
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>