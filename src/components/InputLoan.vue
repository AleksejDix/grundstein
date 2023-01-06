<template>
    <div>
        <label for="loan">Hypothek</label>
        <input 
            type="text"
            id="loan" 
            name="loan" 
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="rounded w-full bg-gray-300 border-none"
        />
        <label for="loanrange" hidden>Loan</label>
        <input
            type="range" 
            id="loanrange" 
            name="loanrange"
            min="0"
            step="1000"
            max="1000000"
            :value="modelValue"
            @input="$emit('update:modelValue', +$event.target.value)"
            class="w-full h-1 mb-6 bg-gray-300 rounded-lg appearance-none cursor-pointer">
    </div>
</template>

<script setup lang="ts">
defineProps(['modelValue'])
defineEmits(['update:modelValue'])
</script>