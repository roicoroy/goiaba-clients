import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToast,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
} from "@ionic/react";
import { logIn, mail, lockClosed } from 'ionicons/icons';
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { API_CONFIG } from '../utils/constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("test02@test.com");
  const [password, setPassword] = useState("Rwbento123!");
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const history = useHistory();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/customer/emailpass`, {
        method: "POST",
        credentials: "include", // Important: include cookies for session management
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": API_CONFIG.PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('🔐 Login response:', data);
      console.log('🔑 Token in response:', data.token);

      if (response.ok) {
        // Store the JWT token for API calls
        if (data.token) {
          console.log('💾 Storing token:', data.token);
          localStorage.setItem("authToken", data.token);
          
          // Verify it was stored
          const storedToken = localStorage.getItem("authToken");
          console.log('✅ Token stored successfully:', !!storedToken);
        } else {
          console.log('❌ No token in response');
        }
        localStorage.setItem("isAuthenticated", "true");
        
        // Log what's in localStorage
        console.log('📦 localStorage contents:', {
          authToken: localStorage.getItem("authToken"),
          isAuthenticated: localStorage.getItem("isAuthenticated")
        });
        
        // Navigate to main app - CustomerContext will automatically refresh data
        history.push("/tabs/tab1");
      } else {
        console.error("Login failed with status:", response.status);
        setToastMessage('Login failed. Please check your credentials.');
        setToastColor('danger');
        setShowToast(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setToastMessage('An error occurred during login. Please try again.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    history.push('/register');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={logIn} style={{ marginRight: '8px' }} />
              Welcome Back
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '1rem' }}>
              <IonText color="medium">
                <p>Sign in to your account to continue shopping</p>
              </IonText>
            </div>

            <IonItem>
              <IonIcon icon={mail} slot="start" />
              <IonLabel position="stacked">Email Address</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                placeholder="Enter your email"
                required
              />
            </IonItem>

            <IonItem>
              <IonIcon icon={lockClosed} slot="start" />
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                placeholder="Enter your password"
                required
              />
            </IonItem>

            <IonButton 
              expand="block" 
              onClick={handleLogin} 
              disabled={isLoading}
              style={{ marginTop: '2rem' }}
              data-cy="login-button"
            >
              {isLoading ? (
                <>
                  <IonSpinner slot="start" />
                  Signing In...
                </>
              ) : (
                <>
                  <IonIcon icon={logIn} slot="start" />
                  Sign In
                </>
              )}
            </IonButton>

            {/* Register Link */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <IonText color="medium">
                <p>
                  Don't have an account?{' '}
                  <span 
                    style={{ color: 'var(--ion-color-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={navigateToRegister}
                  >
                    Create one here
                  </span>
                </p>
              </IonText>
            </div>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;