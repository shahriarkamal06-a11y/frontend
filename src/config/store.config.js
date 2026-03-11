/**
 * Store Configuration
 * Contains the default store ID and other store-related settings
 */

// Default store ID from your Supabase database
// This should match the store created during database setup
export const DEFAULT_STORE_ID = 'ef80f742-c1d7-438d-b236-b0bdd20356f9';

// Store settings
export const STORE_CONFIG = {
  id: DEFAULT_STORE_ID,
  name: 'My eCommerce Store',
  currency: 'USD',
  timezone: 'UTC',
};

// Helper to get store ID (can be extended for multi-store support)
export const getStoreId = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_STORE_ID;
  }

  // Check if store ID is stored in localStorage (for future multi-store support)
  const storedStoreId = localStorage.getItem('storeId');
  if (storedStoreId) {
    return storedStoreId;
  }
  
  // Return default store ID
  return DEFAULT_STORE_ID;
};

// Set store ID (for multi-store support)
export const setStoreId = (storeId) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem('storeId', storeId);
};

export default {
  DEFAULT_STORE_ID,
  STORE_CONFIG,
  getStoreId,
  setStoreId,
};
