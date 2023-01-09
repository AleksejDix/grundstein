<template>
    <div>
        <label for="term">Laufzeit</label>
        <input 
            type="number"
            id="term" 
            name="term" 
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="rounded w-full bg-gray-300 border-none"
        />
        <label for="termrange" hidden>Term Range</label>
        <input
            type="range" 
            id="termrange" 
            name="termrange"
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="w-full h-1 mb-6 bg-gray-300 rounded-lg appearance-none cursor-pointer">
    </div>
</template>

<script setup lang="ts">
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>