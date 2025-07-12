/**
 * Vitest setup for component testing
 */

import { config } from '@vue/test-utils'

// Configure Vue Test Utils globally
config.global.plugins = []
config.global.components = {}
config.global.directives = {}