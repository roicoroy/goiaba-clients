import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_CONFIG } from '../utils/constants';

interface Address {
    id?: string;
    first_name: string;
    last_name: string;
    company?: string;
    address_1: string;
    address_2?: string;
    city: string;
    country_code: string;
    province?: string;
    postal_code: string;
    phone?: string;
    // Medusa-specific fields
    address_name?: string;
    is_default_billing?: boolean;
    is_default_shipping?: boolean;
    customer_id?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    metadata?: unknown;
}

interface Customer {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    billing_address?: Address;
    shipping_addresses?: Address[]; // All addresses for management
    default_shipping_address?: Address; // The one with is_default_shipping: true
    // Medusa API fields
    addresses?: Address[];
    company_name?: string;
    has_account?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface CustomerContextType {
    customer: Customer | null;
    isLoading: boolean;
    error: string | null;
    updateCustomer: (data: Partial<Customer>) => Promise<void>;
    addShippingAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    updateShippingAddress: (addressId: string, address: Partial<Address>) => Promise<void>;
    deleteShippingAddress: (addressId: string) => Promise<void>;
    updateBillingAddress: (address: Omit<Address, 'id'>) => Promise<void>;
    setDefaultBillingAddress: (addressId: string) => Promise<void>;
    setDefaultShippingAddress: (addressId: string) => Promise<void>;
    fetchCustomer: () => Promise<void>;
    refreshCustomerData: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

interface CustomerProviderProps {
    children: ReactNode;
}

export const CustomerProvider: React.FC<CustomerProviderProps> = ({ children }) => {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCustomer = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');

            console.log('🔍 fetchCustomer called:', { token: !!token, isAuthenticated });

            if (!token || token === 'null' || token === 'undefined' || isAuthenticated !== 'true') {
                console.log('❌ No authentication found, using mock data');
                // Use mock data if not authenticated
                const savedCustomer = localStorage.getItem('mockCustomer');
                if (savedCustomer) {
                    setCustomer(JSON.parse(savedCustomer));
                } else {
                    const mockCustomer: Customer = {
                        id: 'customer_mock_123',
                        email: 'test02@test.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone: '+1234567890',
                        billing_address: undefined,
                        shipping_addresses: [],
                    };
                    setCustomer(mockCustomer);
                    localStorage.setItem('mockCustomer', JSON.stringify(mockCustomer));
                }
                return;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            console.log('🔑 Making authenticated request to /store/customers/me');
            console.log('🔑 Token preview:', token.substring(0, 20) + '...');
            console.log('🔑 Full headers:', headers);

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me`, {
                method: 'GET',
                headers,
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            // Log response headers for debugging
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Customer data from API:', data);

                // Transform Medusa customer data to match our interface
                const customer = data.customer;
                const addresses = customer.addresses || [];

                // Find billing and shipping addresses based on flags

                // Find default billing and shipping addresses based on flags
                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing === true);
                const defaultShippingAddress = addresses.find((addr: Address) => addr.is_default_shipping === true);

                // All addresses for management (not filtered)
                const allAddresses = addresses;

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: allAddresses, // All addresses for management
                    billing_address: billingAddress,
                    // Add default shipping address as a separate field
                    default_shipping_address: defaultShippingAddress,
                };

                console.log('� Tranpsformed customer:', transformedCustomer);
                console.log('💳 Billing address:', billingAddress);
                console.log('🚚 Default shipping address:', defaultShippingAddress);
                console.log('📦 All addresses:', allAddresses);
                setCustomer(transformedCustomer);
                
                // Clear mock data since we have real data
                localStorage.removeItem('mockCustomer');
            } else if (response.status === 401) {
                const errorText = await response.text();
                console.log('❌ 401 Unauthorized - token may be invalid or expired');
                console.log('❌ Error details:', errorText);
                
                // Clear invalid token
                console.log('🧹 Clearing invalid authentication data');
                localStorage.removeItem('authToken');
                localStorage.removeItem('isAuthenticated');
                
                // Dispatch event to notify other components of auth failure
                window.dispatchEvent(new CustomEvent('authStateChanged'));
                
                // Use mock data as fallback
                console.log('🔄 Falling back to mock data');
                const savedCustomer = localStorage.getItem('mockCustomer');
                if (savedCustomer) {
                    setCustomer(JSON.parse(savedCustomer));
                } else {
                    // Mock customer data for demonstration
                    const mockCustomer: Customer = {
                        id: 'customer_mock_123',
                        email: 'test02@test.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone: '+1234567890',
                        billing_address: undefined,
                        shipping_addresses: [],
                    };
                    setCustomer(mockCustomer);
                    localStorage.setItem('mockCustomer', JSON.stringify(mockCustomer));
                }
            } else {
                const errorText = await response.text();
                console.error('❌ API request failed:', response.status, errorText);
                // Don't throw error, just use mock data
                console.log('🔄 Using mock data due to API error');
                const savedCustomer = localStorage.getItem('mockCustomer');
                if (savedCustomer) {
                    setCustomer(JSON.parse(savedCustomer));
                } else {
                    const mockCustomer: Customer = {
                        id: 'customer_mock_123',
                        email: 'test02@test.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone: '+1234567890',
                        billing_address: undefined,
                        shipping_addresses: [],
                    };
                    setCustomer(mockCustomer);
                    localStorage.setItem('mockCustomer', JSON.stringify(mockCustomer));
                }
            }
        } catch (err) {
            console.error('Failed to fetch customer:', err);
            // Don't set error, just use mock data
            console.log('🔄 Using mock data due to fetch error');

            // Fallback to mock data on error
            const savedCustomer = localStorage.getItem('mockCustomer');
            if (savedCustomer) {
                setCustomer(JSON.parse(savedCustomer));
            } else {
                const mockCustomer: Customer = {
                    id: 'customer_mock_123',
                    email: 'test02@test.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    phone: '+1234567890',
                    billing_address: undefined,
                    shipping_addresses: [],
                };
                setCustomer(mockCustomer);
                localStorage.setItem('mockCustomer', JSON.stringify(mockCustomer));
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateCustomer = async (data: Partial<Customer>) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('🔄 Updating customer with data:', data);

            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            
            if (!token || !isAuthenticated) {
                throw new Error('No authentication token found');
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            console.log('📡 Making request to /store/customers/me');
            console.log('📦 Request headers:', headers);
            console.log('📦 Request body:', JSON.stringify(data));

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    company_name: data.company_name,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone: data.phone,
                }),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Customer updated, API response:', responseData);

                const customer = responseData.customer;
                const addresses = customer.addresses || [];

                // Find billing and shipping addresses based on flags
                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing === true);
                const defaultShippingAddress = addresses.find((addr: Address) => addr.is_default_shipping === true);

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: addresses,
                    billing_address: billingAddress,
                    default_shipping_address: defaultShippingAddress,
                };

                console.log('🔄 Customer updated successfully:', transformedCustomer);
                setCustomer(transformedCustomer);
            } else {
                const errorText = await response.text();
                console.error('❌ API request failed:', response.status, errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to update customer:', err);
            setError(err instanceof Error ? err.message : 'Failed to update customer');
            throw err; // Re-throw to let the component handle the error
        } finally {
            setIsLoading(false);
        }
    };

    const addShippingAddress = async (address: Omit<Address, 'id'>) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('📍 Adding shipping address:', address);

            // Try to add via API first
            const token = localStorage.getItem('authToken');
            console.log('🔑 Token available:', !!token);

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // For shipping addresses, ensure correct flags
            const shippingAddressData = {
                ...address,
                is_default_billing: false,
                is_default_shipping: true, // You might want to make this configurable
            };

            console.log('📡 Making request to /store/customers/me/addresses');
            console.log('📦 Request body:', JSON.stringify(shippingAddressData));

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses`, {
                method: 'POST',
                headers,
                body: JSON.stringify(shippingAddressData),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Address added successfully!');
                console.log('📋 Full API response:', responseData);

                // Transform the response to match our interface
                const customer = responseData.customer;
                console.log('👤 Customer from response:', customer);
                console.log('📍 Addresses in response:', customer.addresses);

                const addresses = customer.addresses || [];

                // Find billing and shipping addresses based on flags
                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing);
                const shippingAddresses = addresses.filter((addr: Address) => !addr.is_default_billing);

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: shippingAddresses,
                    billing_address: billingAddress,
                };

                setCustomer(transformedCustomer);

                // Also refresh customer data to ensure we have the latest
                console.log('🔄 Refreshing customer data to ensure sync...');
                setTimeout(() => fetchCustomer(), 500);
            } else {
                const errorText = await response.text();
                console.error('❌ API request failed:', response.status, errorText);
                console.log('🔄 Falling back to refresh customer data...');

                // Even if the add failed, refresh to see current state
                setTimeout(() => fetchCustomer(), 500);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to add shipping address:', err);
            setError('Failed to add shipping address');

            // Fallback to local storage
            const newAddress = { ...address, id: `addr_${Date.now()}` };
            const updatedCustomer = {
                ...customer!,
                shipping_addresses: [...(customer?.shipping_addresses || []), newAddress]
            };
            setCustomer(updatedCustomer);
            localStorage.setItem('mockCustomer', JSON.stringify(updatedCustomer));
        } finally {
            setIsLoading(false);
        }
    };

    const updateShippingAddress = async (addressId: string, address: Partial<Address>) => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const updatedAddresses = customer?.shipping_addresses?.map(addr =>
                addr.id === addressId ? { ...addr, ...address } : addr
            ) || [];

            const updatedCustomer = {
                ...customer!,
                shipping_addresses: updatedAddresses
            };
            setCustomer(updatedCustomer);
            localStorage.setItem('mockCustomer', JSON.stringify(updatedCustomer));
        } catch (err) {
            console.error('Failed to update shipping address:', err);
            setError('Failed to update shipping address');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteShippingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 300));

            const updatedAddresses = customer?.shipping_addresses?.filter(addr => addr.id !== addressId) || [];
            const updatedCustomer = {
                ...customer!,
                shipping_addresses: updatedAddresses
            };
            setCustomer(updatedCustomer);
            localStorage.setItem('mockCustomer', JSON.stringify(updatedCustomer));
        } catch (err) {
            console.error('Failed to delete shipping address:', err);
            setError('Failed to delete shipping address');
        } finally {
            setIsLoading(false);
        }
    };

    const updateBillingAddress = async (address: Omit<Address, 'id'>) => {
        try {
            setIsLoading(true);
            setError(null);

            console.log('💳 Adding billing address:', address);

            // Try to add via API first
            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');
            
            console.log('🔑 Auth state:', { token: !!token, isAuthenticated });
            
            if (!token || !isAuthenticated) {
                console.log('❌ No authentication, using mock data');
                // Fallback to local storage
                const updatedCustomer = {
                    ...customer!,
                    billing_address: { ...address, id: `billing_${Date.now()}` }
                };
                setCustomer(updatedCustomer);
                localStorage.setItem('mockCustomer', JSON.stringify(updatedCustomer));
                return;
            }

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
                'Authorization': `Bearer ${token}`,
            };

            // In Medusa, billing address needs the is_default_billing flag
            const billingAddressData = {
                ...address,
                is_default_billing: true,
                is_default_shipping: false,
            };

            console.log('📡 Making request to /store/customers/me/addresses for billing');
            console.log('📦 Request body:', JSON.stringify(billingAddressData));

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses`, {
                method: 'POST',
                headers,
                body: JSON.stringify(billingAddressData),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response ok:', response.ok);

            if (response.ok) {
                const responseData = await response.json();
                console.log('✅ Billing address added successfully!');
                console.log('📋 Full API response:', responseData);

                // Transform the response to match our interface
                const customer = responseData.customer;
                console.log('👤 Customer from response:', customer);
                console.log('📍 Addresses in response:', customer.addresses);

                const addresses = customer.addresses || [];

                // Find billing and shipping addresses based on flags
                const billingAddress = addresses.find((addr: Address) => addr.is_default_billing);
                const shippingAddresses = addresses.filter((addr: Address) => !addr.is_default_billing);

                const transformedCustomer: Customer = {
                    ...customer,
                    shipping_addresses: shippingAddresses,
                    billing_address: billingAddress,
                };

                console.log('🔄 Transformed customer with billing:', transformedCustomer);
                console.log('💳 New billing address:', billingAddress);
                setCustomer(transformedCustomer);

                // Also refresh customer data to ensure we have the latest
                console.log('🔄 Refreshing customer data to ensure sync...');
                setTimeout(() => fetchCustomer(), 500);
            } else {
                const errorText = await response.text();
                console.error('❌ API request failed:', response.status, errorText);
                console.log('🔄 Falling back to refresh customer data...');

                // Even if the add failed, refresh to see current state
                setTimeout(() => fetchCustomer(), 500);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to update billing address:', err);
            setError('Failed to update billing address');

            // Fallback to local storage
            const updatedCustomer = {
                ...customer!,
                billing_address: { ...address, id: `billing_${Date.now()}` }
            };
            setCustomer(updatedCustomer);
            localStorage.setItem('mockCustomer', JSON.stringify(updatedCustomer));
        } finally {
            setIsLoading(false);
        }
    };

    const setDefaultBillingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Find the address to update
            const addressToUpdate = customer?.shipping_addresses?.find(addr => addr.id === addressId);
            if (!addressToUpdate) {
                throw new Error('Address not found');
            }

            console.log('💳 Setting default billing address:', addressId);

            // Clean the address data - remove null values and only send required fields
            const cleanAddressData = {
                first_name: addressToUpdate.first_name,
                last_name: addressToUpdate.last_name,
                address_1: addressToUpdate.address_1,
                city: addressToUpdate.city,
                country_code: addressToUpdate.country_code,
                postal_code: addressToUpdate.postal_code,
                is_default_billing: true,
                // Only include optional fields if they have actual values
                ...(addressToUpdate.company && { company: addressToUpdate.company }),
                ...(addressToUpdate.address_2 && { address_2: addressToUpdate.address_2 }),
                ...(addressToUpdate.province && { province: addressToUpdate.province }),
                ...(addressToUpdate.phone && { phone: addressToUpdate.phone }),
            };

            console.log('📦 Sending clean address data:', cleanAddressData);

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(cleanAddressData),
            });

            if (response.ok) {
                console.log('✅ Default billing address updated');
                await fetchCustomer(); // Refresh customer data
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to set default billing: ${response.status} ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to set default billing address:', err);
            setError('Failed to set default billing address');
        } finally {
            setIsLoading(false);
        }
    };

    const setDefaultShippingAddress = async (addressId: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'x-publishable-api-key': API_CONFIG.PUBLISHABLE_KEY,
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Find the address to update
            const addressToUpdate = customer?.shipping_addresses?.find(addr => addr.id === addressId);
            if (!addressToUpdate) {
                throw new Error('Address not found');
            }

            console.log('🚚 Setting default shipping address:', addressId);

            // Clean the address data - remove null values and only send required fields
            const cleanAddressData = {
                first_name: addressToUpdate.first_name,
                last_name: addressToUpdate.last_name,
                address_1: addressToUpdate.address_1,
                city: addressToUpdate.city,
                country_code: addressToUpdate.country_code,
                postal_code: addressToUpdate.postal_code,
                is_default_shipping: true,
                // Only include optional fields if they have actual values
                ...(addressToUpdate.company && { company: addressToUpdate.company }),
                ...(addressToUpdate.address_2 && { address_2: addressToUpdate.address_2 }),
                ...(addressToUpdate.province && { province: addressToUpdate.province }),
                ...(addressToUpdate.phone && { phone: addressToUpdate.phone }),
            };

            console.log('📦 Sending clean address data:', cleanAddressData);

            const response = await fetch(`${API_CONFIG.BASE_URL}/store/customers/me/addresses/${addressId}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(cleanAddressData),
            });

            if (response.ok) {
                console.log('✅ Default shipping address updated');
                await fetchCustomer(); // Refresh customer data
            } else {
                const errorText = await response.text();
                throw new Error(`Failed to set default shipping: ${response.status} ${errorText}`);
            }
        } catch (err) {
            console.error('Failed to set default shipping address:', err);
            setError('Failed to set default shipping address');
        } finally {
            setIsLoading(false);
        }
    };

    // Load customer when authenticated
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const isAuthenticated = localStorage.getItem('isAuthenticated');

        console.log('🔄 CustomerContext useEffect - checking auth state:', { 
            token: !!token, 
            isAuthenticated,
            tokenLength: token?.length || 0
        });

        if (token && token !== 'null' && token !== 'undefined' && token.trim().length > 0 && isAuthenticated === 'true') {
            console.log('✅ Valid authentication found, fetching customer');
            fetchCustomer();
        } else {
            console.log('❌ No valid authentication, using mock data', {
                hasToken: !!token,
                tokenValid: token && token !== 'null' && token !== 'undefined' && token.trim().length > 0,
                isAuthenticatedValue: isAuthenticated
            });
            // Load mock data if not authenticated
            const savedCustomer = localStorage.getItem('mockCustomer');
            if (savedCustomer) {
                console.log('📦 Loading saved mock customer');
                setCustomer(JSON.parse(savedCustomer));
            } else {
                console.log('🆕 Creating new mock customer');
                // Create mock customer data
                const mockCustomer: Customer = {
                    id: 'customer_mock_123',
                    email: 'test02@test.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    phone: '+1234567890',
                    billing_address: undefined,
                    shipping_addresses: [],
                };
                setCustomer(mockCustomer);
                localStorage.setItem('mockCustomer', JSON.stringify(mockCustomer));
            }
        }
    }, []); // Remove fetchCustomer dependency to prevent infinite loops

    // Listen for authentication state changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');

            console.log('📦 Storage change detected:', { 
                key: e.key,
                token: !!token, 
                isAuthenticated, 
                customerId: customer?.id 
            });

            if (token && token !== 'null' && token !== 'undefined' && token.trim().length > 0 && isAuthenticated === 'true' && customer?.id?.startsWith('customer_mock')) {
                // User has token but still showing mock data - fetch real data
                console.log('🔄 Fetching real customer data after storage change');
                fetchCustomer();
            }
        };

        // Listen for storage changes from other tabs
        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events within the same tab
        const handleAuthChange = () => {
            const token = localStorage.getItem('authToken');
            const isAuthenticated = localStorage.getItem('isAuthenticated');

            console.log('🔔 Auth change event:', { token: !!token, isAuthenticated });

            if (token && token !== 'null' && token !== 'undefined' && token.trim().length > 0 && isAuthenticated === 'true') {
                console.log('🔄 Auth change detected, fetching customer data');
                // Add delay to prevent rapid successive calls
                setTimeout(() => {
                    fetchCustomer();
                }, 500);
            }
        };

        window.addEventListener('authStateChanged', handleAuthChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleAuthChange);
        };
    }, [customer?.id]); // Remove fetchCustomer dependency

    const refreshCustomerData = () => {
        const token = localStorage.getItem('authToken');
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        if (token && token !== 'null' && token !== 'undefined' && token.trim().length > 0 && isAuthenticated === 'true') {
            console.log('🔄 Manually refreshing customer data');
            fetchCustomer();
        } else {
            console.log('❌ Cannot refresh: no valid authentication');
        }
    };

    const value: CustomerContextType = {
        customer,
        isLoading,
        error,
        updateCustomer,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        updateBillingAddress,
        setDefaultBillingAddress,
        setDefaultShippingAddress,
        fetchCustomer,
        refreshCustomerData,
    };

    return (
        <CustomerContext.Provider value={value}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomerContext = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomerContext must be used within a CustomerProvider');
    }
    return context;
};