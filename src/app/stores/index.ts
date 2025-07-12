/**
 * Pinia Stores
 * 
 * Minimal store setup - stores are just shared refs
 * All business logic lives in the domain layer
 */

export { useUserStore } from './userStore';
export { useMortgageDataStore } from './mortgageDataStore';
export type { MortgageData } from './mortgageDataStore';