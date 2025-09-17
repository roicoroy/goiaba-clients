export const API_CONFIG = {
  BASE_URL: 'https://86crq95z-9000.uks1.devtunnels.ms',
  PUBLISHABLE_KEY: 'pk_3674d9928e02a60db06eba508b8b7dd7a3d70c9cee8b6ab7c4f5fdcdddc1478f',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  IS_AUTHENTICATED: 'isAuthenticated',
  SELECTED_REGION_ID: 'selectedRegionId',
  CART_ID: 'cartId',
  MOCK_CUSTOMER: 'mockCustomer',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  TABS: '/tabs',
  TAB1: '/tabs/tab1',
  TAB2: '/tabs/tab2',
  TAB3: '/tabs/tab3',
  PRODUCT_DETAILS: '/tabs/product',
} as const;

export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 4000,
} as const;