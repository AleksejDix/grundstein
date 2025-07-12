<template>
  <div v-if="hasError" class="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg 
          class="h-6 w-6 text-red-400" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-lg font-semibold text-red-800 mb-2">
          Calculator Error
        </h3>
        <p class="text-red-700 mb-4">
          {{ errorMessage || 'The mortgage calculator encountered an unexpected error. Please try refreshing the page.' }}
        </p>
        
        <div class="flex space-x-4">
          <button
            @click="retry"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
          
          <button
            @click="reportError"
            class="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            <svg class="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Report Issue
          </button>
        </div>

        <!-- Technical Details (for development) -->
        <details v-if="isDevelopment" class="mt-4">
          <summary class="cursor-pointer text-sm text-red-600 hover:text-red-800">
            Technical Details
          </summary>
          <pre class="mt-2 text-xs text-red-600 bg-red-100 p-3 rounded border overflow-auto">{{ technicalDetails }}</pre>
        </details>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'

// Props
interface Props {
  fallbackMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: 'Something went wrong with the mortgage calculator.'
})

// Emits
const emit = defineEmits<{
  error: [error: Error, info: string]
  retry: []
}>()

// State
const hasError = ref(false)
const errorMessage = ref('')
const technicalDetails = ref('')
const isDevelopment = ref(import.meta.env.DEV)

// Error capture
onErrorCaptured((error: Error, instance, info: string) => {
  hasError.value = true
  errorMessage.value = error.message || props.fallbackMessage
  technicalDetails.value = `Error: ${error.message}\nStack: ${error.stack}\nComponent Info: ${info}`
  
  // Log error for monitoring
  console.error('MortgageCalculator Error:', {
    error,
    instance,
    info,
    timestamp: new Date().toISOString()
  })
  
  // Emit error event for parent handling
  emit('error', error, info)
  
  // Report to error tracking service in production
  if (!isDevelopment.value) {
    reportToErrorService(error, info)
  }
  
  // Prevent error from propagating
  return false
})

// Error handling functions
function retry() {
  hasError.value = false
  errorMessage.value = ''
  technicalDetails.value = ''
  emit('retry')
}

function reportError() {
  // In a real app, this would integrate with error reporting service
  const errorReport = {
    message: errorMessage.value,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    technicalDetails: technicalDetails.value
  }
  
  console.log('Error report:', errorReport)
  
  // Example: Send to error reporting service
  // errorReportingService.report(errorReport)
  
  alert('Error report has been logged. Thank you for helping us improve!')
}

function reportToErrorService(error: Error, info: string) {
  // Integration point for error monitoring services like Sentry, LogRocket, etc.
  try {
    // Example implementation:
    // Sentry.captureException(error, {
    //   tags: {
    //     component: 'MortgageCalculator',
    //     section: info
    //   },
    //   extra: {
    //     componentInfo: info,
    //     timestamp: new Date().toISOString()
    //   }
    // })
    
    console.log('Error reported to monitoring service:', { error, info })
  } catch (reportingError) {
    console.error('Failed to report error to monitoring service:', reportingError)
  }
}
</script>