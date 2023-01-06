<template>
    <div>
        <label for="repainmentRate">Tilgung</label>
        <input 
            type="number"
            id="repainmentRate" 
            step="0.01"
            name="repainmentRate" 
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="rounded w-full"
        />
        <label for="repainmentRaterange" hidden>repainmentRate</label>
        <input
            type="range" 
            id="repainmentRaterange" 
            name="repainmentRaterange"
            min="1"
            step="0.01"
            max="20"
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="w-full h-1 mb-6 bg-gray-200 rounded-lg appearance-none cursor-pointer">
    </div>
</template>

<script setup lang="ts">
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>