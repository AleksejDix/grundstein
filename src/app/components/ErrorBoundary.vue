<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <svg
          class="mx-auto h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <h2 class="mt-4 text-2xl font-bold text-gray-900">
          Oops! Something went wrong
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="space-y-4">
          <div v-if="errorInfo" class="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 class="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
            <p class="text-xs text-red-700 font-mono break-all">
              {{ errorInfo.message }}
            </p>
            <p v-if="errorInfo.stack" class="text-xs text-red-600 mt-2 font-mono">
              {{ errorInfo.stack.split('\n')[0] }}
            </p>
          </div>

          <div class="flex space-x-3">
            <button
              @click="retry"
              class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Try Again
            </button>
            <button
              @click="goHome"
              class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Go Home
            </button>
          </div>

          <button
            @click="reportError"
            class="w-full text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Report this issue
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { errorLogger } from '../../utils/errorLogger';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

interface Props {
  error?: Error;
  errorInfo?: ErrorInfo;
}

const props = defineProps<Props>();
const router = useRouter();
const errorInfo = ref<ErrorInfo | null>(null);

onMounted(() => {
  if (props.error) {
    errorInfo.value = {
      message: props.error.message,
      stack: props.error.stack,
      componentStack: props.errorInfo?.componentStack,
    };

    // Log the error
    errorLogger.logError(props.error, {
      context: 'ErrorBoundary',
      componentStack: props.errorInfo?.componentStack,
    });
  }
});

const retry = () => {
  window.location.reload();
};

const goHome = () => {
  router.push('/');
};

const reportError = () => {
  const subject = encodeURIComponent('Error Report: Grundstein Application');
  const body = encodeURIComponent(`
Error: ${errorInfo.value?.message || 'Unknown error'}
Stack: ${errorInfo.value?.stack || 'No stack trace'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
  `);
  
  window.open(`mailto:support@grundstein.app?subject=${subject}&body=${body}`);
};
</script>