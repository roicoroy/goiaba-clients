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
} from "@ionic/react";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { API_CONFIG } from '../utils/constants';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("test02@test.com");
  const [password, setPassword] = useState("Rwbento123!");
  const history = useHistory();

  const handleLogin = async () => {
    try {
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
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
          ></IonInput>
        </IonItem>
        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          ></IonInput>
        </IonItem>
        <IonButton expand="full" onClick={handleLogin} data-cy="login-button">
          Login
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
