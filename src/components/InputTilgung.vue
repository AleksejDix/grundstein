<template>
    <div>
        <label for="tilgung">tilgung</label>
        <input 
            type="number"
            id="tilgung" 
            step="0.01"
            name="tilgung" 
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="rounded w-full"
        />
        <label for="tilgungSlider" hidden>tilgungSlider</label>
        <input
            type="range" 
            id="tilgungSlider" 
            name="tilgungSlider"
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