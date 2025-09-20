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
import { useCartShippingOptions } from 'medusa-react';
import { useCartContext } from '../contexts/CartContext';
import { useMedusa } from 'medusa-react';
import { formatPrice } from '../utils/formatters';

interface CheckoutShippingProps {
  onNext: () => void;
  onPrevious: () => void;
}

const CheckoutShipping: React.FC<CheckoutShippingProps> = ({ onNext, onPrevious }) => {
  console.log('🚚 CheckoutShipping: Component render START');
  
  const { cart } = useCartContext();
  console.log('🚚 CheckoutShipping: Cart context loaded');
  
  const { shipping_options, isLoading: optionsLoading } = useCartShippingOptions(cart?.id || '', {
    enabled: !!cart?.id,
  });
  console.log('🚚 CheckoutShipping: useCartShippingOptions completed', { 
    hasOptions: !!shipping_options, 
    optionsCount: shipping_options?.length || 0,
    optionsLoading 
  });
  
  const { client } = useMedusa();
  console.log('🚚 CheckoutShipping: Medusa client loaded');
  
  const [selectedShippingOptionId, setSelectedShippingOptionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log('🚚 CheckoutShipping: State initialized');

  // Auto-select first shipping option if available
  useEffect(() => {
    console.log('🚚 CheckoutShipping: useEffect START', { 
      hasOptions: !!shipping_options, 
      optionsLength: shipping_options?.length || 0,
      currentSelection: selectedShippingOptionId 
    });
    if (shipping_options && shipping_options.length > 0 && !selectedShippingOptionId) {
      console.log('🚚 CheckoutShipping: Auto-selecting first shipping option');
      setSelectedShippingOptionId(shipping_options[0].id);
    }
    console.log('🚚 CheckoutShipping: useEffect END');
  }, [shipping_options, selectedShippingOptionId]);

  const handleAddShippingMethod = async () => {
    console.log('🚚 CheckoutShipping: handleAddShippingMethod START');
    if (!cart?.id || !selectedShippingOptionId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await client.carts.addShippingMethod(cart.id, {
        option_id: selectedShippingOptionId,
      });
      
      onNext();
    } catch (err) {
      console.error('Failed to add shipping method:', err);
      setError('Failed to add shipping method');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = selectedShippingOptionId !== '';

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
          {optionsLoading ? (
            <IonItem>
              <IonLabel>
                <IonText color="medium">Loading shipping options...</IonText>
              </IonLabel>
              <IonSpinner slot="end" />
            </IonItem>
          ) : shipping_options && shipping_options.length > 0 ? (
            <IonRadioGroup 
              value={selectedShippingOptionId} 
              onIonChange={(e) => {
                setSelectedShippingOptionId(e.detail.value);
              }}
            >
              <IonList>
                {shipping_options.map((option) => (
                  <IonItem key={option.id}>
                    <IonRadio slot="start" value={option.id} />
                    <IonLabel>
                      <h3>{option.name}</h3>
                      <p>{formatPrice(option.amount || 0, cart?.currency_code || 'USD')}</p>
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