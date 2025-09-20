import { API_CONFIG } from '../utils/constants';
import { 
  RegisterPayload, 
  RegisterResponse, 
  CreateCustomerPayload, 
  CreateCustomerResponse,
  LoginPayload,
  LoginResponse
} from '../interfaces/auth';

export class AuthService {
  private static baseUrl = API_CONFIG.BASE_URL;
  private static publishableKey = API_CONFIG.PUBLISHABLE_KEY;

  private static getHeaders(includeAuth = false, token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-publishable-api-key': this.publishableKey,
    };

    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  static async register(payload: RegisterPayload): Promise<{ token: string; customer: any }> {
    try {
      console.log('🔐 Starting registration process...');
      console.log('📧 Email:', payload.email);

      // Step 1: Register the user authentication
      const registerResponse = await fetch(`${this.baseUrl}/auth/customer/emailpass/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.text();
        console.error('❌ Registration failed:', registerResponse.status, errorData);
        throw new Error(`Registration failed: ${registerResponse.status} ${errorData}`);
      }

      const { token }: RegisterResponse = await registerResponse.json();
      console.log('✅ Registration successful, token received');

      // Step 2: Create the customer profile
      const customerPayload: CreateCustomerPayload = {
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        company_name: payload.company_name,
        phone: payload.phone,
      };

      console.log('👤 Creating customer profile...');
      const customerResponse = await fetch(`${this.baseUrl}/store/customers`, {
        method: 'POST',
        headers: this.getHeaders(true, token),
        body: JSON.stringify(customerPayload),
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.text();
        console.error('❌ Customer creation failed:', customerResponse.status, errorData);
        throw new Error(`Customer creation failed: ${customerResponse.status} ${errorData}`);
      }

      const { customer }: CreateCustomerResponse = await customerResponse.json();
      console.log('✅ Customer profile created successfully');

      return { token, customer };
    } catch (error) {
      console.error('💥 Registration process failed:', error);
      throw error;
    }
  }

  static async login(payload: LoginPayload): Promise<{ token: string }> {
    try {
      console.log('🔐 Starting login process...');
      console.log('📧 Email:', payload.email);

      const response = await fetch(`${this.baseUrl}/auth/customer/emailpass`, {
        method: 'POST',
        credentials: 'include',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Login failed:', response.status, errorData);
        throw new Error(`Login failed: ${response.status} ${errorData}`);
      }

      const data: LoginResponse = await response.json();
      console.log('✅ Login successful');

      return data;
    } catch (error) {
      console.error('💥 Login process failed:', error);
      throw error;
    }
  }
}