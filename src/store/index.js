import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storage, applyTheme } from '../utils';
import { authAPI, cartAPI, storeAPI, userAPI, wishlistAPI } from '../services/api';
import { THEME_PRESETS } from '../constants';
import { DEFAULT_STORE, DEFAULT_THEME, normalizeStore, normalizeTheme } from '../utils/storeSettings';

const createNoopStorage = () => ({
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
});

const persistStorage = createJSONStorage(() =>
  typeof window !== 'undefined' ? window.localStorage : createNoopStorage()
);

const getApiErrorMessage = (error, fallbackMessage) => {
  // Check for validation errors first
  const errors = error?.response?.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    return errors.map(err => err.message || err.field).join(', ');
  }
  // Check for general message
  return error?.response?.data?.message || fallbackMessage;
};

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      initializeAuth: async () => {
        const { isInitialized } = get();
        if (isInitialized) return;
        
        set({ isLoading: true });
        
        const accessToken = storage.get('accessToken');
        const refreshToken = storage.get('refreshToken');
        
        if (!accessToken || !refreshToken) {
          set({ 
            isLoading: false, 
            isInitialized: true,
            isAuthenticated: false,
            user: null 
          });
          return;
        }
        
        try {
          // Validate token by fetching user profile
          const response = await userAPI.getProfile();
          const user = response.data.data;
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            isInitialized: true 
          });
        } catch (error) {
          // Token is invalid, clear auth state
          storage.remove('accessToken');
          storage.remove('refreshToken');
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            isInitialized: true,
            error: null 
          });
        }
      },

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { user, accessToken, refreshToken } = response.data.data;
          
          storage.set('accessToken', accessToken);
          storage.set('refreshToken', refreshToken);
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          return { success: true };
        } catch (error) {
          const message = getApiErrorMessage(error, 'Login failed');
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          // Don't auto-login after registration - user needs to verify email first
          set({ isLoading: false });
          
          return { success: true, requiresVerification: true };
        } catch (error) {
          const message = getApiErrorMessage(error, 'Registration failed');
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      logout: async () => {
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          storage.remove('accessToken');
          storage.remove('refreshToken');
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null 
          });
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userAPI.updateProfile(data);
          const updatedUser = response.data.data;
          
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
          
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Profile update failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      storage: persistStorage,
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize auth after rehydration
        if (state) {
          setTimeout(() => state.initializeAuth(), 0);
        }
      },
    }
  )
);

// Cart Store
export const useCartStore = create(
  persist(
    (set, get) => {
      const syncCartState = (cart = {}) => {
        set({
          items: cart.items || [],
          subtotal: Number(cart.subtotal) || 0,
          tax: Number(cart.tax) || 0,
          shipping: Number(cart.shipping) || 0,
          discount: Number(cart.discount) || 0,
          total: Number(cart.total) || 0,
          couponCode: cart.couponCode || null,
          isLoading: false,
        });
      };

      return ({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      couponCode: null,
      isLoading: false,

      calculateTotals: () => {
        const { items, discount } = get();
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
        const total = subtotal + tax + shipping - discount;

        set({ subtotal, tax, shipping, total });
      },

      addItem: async (product, variantId = null, quantity = 1) => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.addToCart({
            productId: product.id,
            variantId,
            quantity
          });

          syncCartState(response.data.data);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      updateItem: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.updateCartItem(itemId, { quantity });
          syncCartState(response.data.data);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.removeFromCart(itemId);
          syncCartState(response.data.data);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      applyCoupon: async (code) => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.applyCoupon(code);
          syncCartState(response.data.data);
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeCoupon: async () => {
        try {
          const response = await cartAPI.removeCoupon();
          syncCartState(response.data.data);
        } catch (error) {
          console.error('Remove coupon error:', error);
        }
      },

      clearCart: async () => {
        try {
          const response = await cartAPI.clearCart();
          syncCartState(response.data.data);
        } catch (error) {
          console.error('Clear cart error:', error);
        }
      },

      loadCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.getCart();
          syncCartState(response.data.data);
        } catch (error) {
          set({ isLoading: false });
          console.error('Load cart error:', error);
        }
      },
    })},
    {
      name: 'cart-store',
      storage: persistStorage,
      partialize: (state) => ({ 
        items: state.items,
        couponCode: state.couponCode,
        discount: state.discount
      }),
    }
  )
);

// Theme Store
export const useThemeStore = create(
  persist(
    (set, get) => ({
      currentTheme: THEME_PRESETS.modern,
      customThemes: [],

      setTheme: (theme) => {
        set({ currentTheme: theme });
        applyTheme(theme);
      },

      updateTheme: (updates) => {
        const { currentTheme } = get();
        const updatedTheme = { ...currentTheme, ...updates };
        set({ currentTheme: updatedTheme });
        applyTheme(updatedTheme);
      },

      saveCustomTheme: (name, theme) => {
        const { customThemes } = get();
        const newTheme = { id: Date.now().toString(), name, ...theme };
        set({ customThemes: [...customThemes, newTheme] });
      },

      deleteCustomTheme: (themeId) => {
        const { customThemes } = get();
        set({ customThemes: customThemes.filter(theme => theme.id !== themeId) });
      },

      resetToDefault: () => {
        const defaultTheme = THEME_PRESETS.modern;
        set({ currentTheme: defaultTheme });
        applyTheme(defaultTheme);
      },
    }),
    {
      name: 'theme-store',
      storage: persistStorage,
    }
  )
);

export const useStoreSettingsStore = create((set, get) => ({
  store: DEFAULT_STORE,
  theme: DEFAULT_THEME,
  isLoading: false,
  hasLoaded: false,
  error: null,

  loadSettings: async ({ force = false } = {}) => {
    const { isLoading, hasLoaded, store, theme } = get();

    if (isLoading) {
      return { success: false };
    }

    if (hasLoaded && !force) {
      return { success: true, data: { store, theme } };
    }

    set({ isLoading: true, error: null });

    try {
      const response = await storeAPI.getCurrentSettings();
      const nextStore = normalizeStore(response?.data?.data?.store || {});
      const nextTheme = normalizeTheme(response?.data?.data?.theme || {});

      set({
        store: nextStore,
        theme: nextTheme,
        isLoading: false,
        hasLoaded: true,
        error: null,
      });

      useThemeStore.getState().setTheme(nextTheme);

      return { success: true, data: { store: nextStore, theme: nextTheme } };
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, 'Failed to load store settings'),
      });
      return { success: false, error };
    }
  },

  setSettings: (settings = {}) => {
    const nextStore = normalizeStore(settings.store || {});
    const nextTheme = normalizeTheme(settings.theme || {});

    set({
      store: nextStore,
      theme: nextTheme,
      hasLoaded: true,
      error: null,
    });

    useThemeStore.getState().setTheme(nextTheme);
  },
}));

// UI Store
export const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  // Mobile menu
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),

  // Search
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),

  // Cart drawer
  cartOpen: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),

  // Modals
  modals: {},
  openModal: (modalId, data = null) => set((state) => ({
    modals: { ...state.modals, [modalId]: { open: true, data } }
  })),
  closeModal: (modalId) => set((state) => ({
    modals: { ...state.modals, [modalId]: { open: false, data: null } }
  })),

  // Loading states
  loading: {},
  setLoading: (key, isLoading) => set((state) => ({
    loading: { ...state.loading, [key]: isLoading }
  })),

  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { 
      id: Date.now().toString(), 
      ...notification 
    }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
}));

// Wishlist Store
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addItem: async (product, variantId = null) => {
        set({ isLoading: true });
        try {
          const response = await wishlistAPI.addToWishlist(product.id, variantId);
          const { items } = response.data.data;
          
          set({ items, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true });
        try {
          await wishlistAPI.removeFromWishlist(itemId);
          const { items } = get();
          const updatedItems = items.filter(item => item.id !== itemId);
          
          set({ items: updatedItems, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.response?.data?.message };
        }
      },

      isInWishlist: (productId, variantId = null) => {
        const { items } = get();
        return items.some(item => 
          item.productId === productId && 
          (variantId ? item.variantId === variantId : !item.variantId)
        );
      },

      loadWishlist: async () => {
        set({ isLoading: true });
        try {
          const response = await wishlistAPI.getWishlist();
          const wishlist = response.data.data;
          
          set({ 
            items: wishlist.items || [],
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Load wishlist error:', error);
          set({ items: [] });
        }
      },

      clearWishlist: async () => {
        try {
          await wishlistAPI.clearWishlist();
          set({ items: [] });
        } catch (error) {
          console.error('Clear wishlist error:', error);
        }
      },
    }),
    {
      name: 'wishlist-store',
      storage: persistStorage,
      partialize: (state) => ({ items: state.items }),
    }
  )
);
