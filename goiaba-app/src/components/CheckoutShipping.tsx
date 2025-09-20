import React, { useState, useEffect } from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonText,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonList,
  IonSpinner,
} from '@ionic/react';
import { car } from 'ionicons/icons';
import { useCartContext } from '../contexts/CartContext';
import { useCheckoutContext } from '../contexts/CheckoutContext';
import { useMedusa } from 'medusa-react';
import { formatPrice } from '../utils/formatters';

interface CheckoutShippingProps {
  onNext: () => void;
  onPrevious: () => void;
}

const CheckoutShipping: React.FC<CheckoutShippingProps> = ({ onNext, onPrevious }) => {
  const { cart } = useCartContext();
  const { 
    shippingMethods, 
    selectedShippingMethod, 
    setSelectedShippingMethod,
    loadShippingMethods 
  } = useCheckoutContext();
  const { client } = useMedusa();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadShippingMethods();
  }, []);

  const handleAddShippingMethod = async () => {
    if (!cart?.id || !selectedShippingMethod) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await client.carts.addShippingMethod(cart.id, {
        option_id: selectedShippingMethod.id,
      });
      
      onNext();
    } catch (err) {
      console.error('Failed to add shipping method:', err);
      setError('Failed to add shipping method');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedShippingMethod !== null;

  return (
    <>
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <IonIcon icon={car} style={{ marginRight: '8px' }} />
            Shipping Method
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {shippingMethods.length > 0 ? (
            <IonRadioGroup 
              value={selectedShippingMethod?.id} 
              onIonChange={(e) => {
                const method = shippingMethods.find(m => m.id === e.detail.value);
                if (method) setSelectedShippingMethod(method);
              }}
            >
              <IonList>
                {shippingMethods.map((method) => (
                  <IonItem key={method.id}>
                    <IonRadio slot="start" value={method.id} />
                    <IonLabel>
                      <h3>{method.name}</h3>
                      <p>{formatPrice(method.amount, method.currency_code)}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            </IonRadioGroup>
          ) : (
            <IonItem>
              <IonLabel>
                <IonText color="medium">No shipping methods available</IonText>
                <p>Please check your shipping address</p>
              </IonLabel>
            </IonItem>
          )}
        </IonCardContent>
      </IonCard>

      {error && (
        <IonCard color="danger">
          <IonCardContent>
            <IonText color="danger">{error}</IonText>
          </IonCardContent>
        </IonCard>
      )}

      <div className="checkout-actions">
        <IonButton 
          expand="block" 
          fill="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Back to Addresses
        </IonButton>
        <IonButton 
          expand="block" 
          onClick={handleAddShippingMethod}
          disabled={!canProceed || isLoading}
        >
          {isLoading ? <IonSpinner /> : 'Continue to Payment'}
        </IonButton>
      </div>
    </>
  );
};

export default CheckoutShipping;