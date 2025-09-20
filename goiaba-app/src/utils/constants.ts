export const API_CONFIG = {
  BASE_URL: 'http://localhost:9000',
  PUBLISHABLE_KEY: 'pk_edc04a825a6de55a445591da014137039c2affad5b75340ee3cfa960db5dd28c',
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