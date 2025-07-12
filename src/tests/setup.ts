/**
 * Vitest test setup for Vue components
 * Configures global mocks and utilities for consistent testing
 */

import { config } from '@vue/test-utils'
import { vi } from 'vitest'
import type { Component } from 'vue'

// Mock Vue Router components globally
const RouterLinkStub: Component = {
  name: 'RouterLink',
  template: '<a :href="to"><slot /></a>',
  props: ['to']
}

const RouterViewStub: Component = {
  name: 'RouterView',
  template: '<div><slot /></div>'
}

// Global component stubs for testing
config.global.stubs = {
  RouterLink: RouterLinkStub,
  RouterView: RouterViewStub,
  // Add any other global components that need stubbing
  Teleport: true,
  Transition: true,
  TransitionGroup: true
}

// Mock common composables
config.global.mocks = {
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  },
  $route: {
    path: '/',
    name: 'home',
    params: {},
    query: {},
    meta: {}
  }
}

// Global plugins and providers can be added here
config.global.plugins = []

// Add global properties if needed
config.global.properties = {}

// Configure global error handling for tests
const originalWarn = console.warn
console.warn = (...args: any[]) => {
  // Suppress Vue Router warnings in tests
  if (args[0]?.includes?.('Component is missing template or render function')) {
    return
  }
  originalWarn(...args)
}