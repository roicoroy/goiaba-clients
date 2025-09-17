import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonIcon,
  IonList,
  IonSpinner,
  IonText,
  IonAlert,
  IonFab,
  IonFabButton,
} from '@ionic/react';
import { add, create, trash, person, refresh } from 'ionicons/icons';
import { useCustomerContext } from '../contexts/CustomerContext';
import AddressForm from '../components/AddressForm';
import CustomerEditForm from '../components/CustomerEditForm';
import './Tab2.css';

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
}

const Tab2: React.FC = () => {
  const {
    customer,
    isLoading,
    error,
    updateCustomer,
    addShippingAddress,
    updateShippingAddress,
    deleteShippingAddress,
    updateBillingAddress,
    setDefaultShippingAddress,
    fetchCustomer,
  } = useCustomerContext();

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressType, setAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [showCustomerEditForm, setShowCustomerEditForm] = useState(false);

  const handleAddAddress = (type: 'shipping' | 'billing') => {
    setAddressType(type);
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address, type: 'shipping' | 'billing') => {
    setAddressType(type);
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (addressData: Omit<Address, 'id'>) => {
    try {
      if (addressType === 'billing') {
        await updateBillingAddress(addressData);
      } else {
        if (editingAddress?.id) {
          await updateShippingAddress(editingAddress.id, addressData);
        } else {
          await addShippingAddress(addressData);
        }
      }
      setShowAddressForm(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressToDelete(addressId);
    setShowDeleteAlert(true);
  };

  const confirmDeleteAddress = async () => {
    if (addressToDelete) {
      await deleteShippingAddress(addressToDelete);
      setAddressToDelete(null);
    }
    setShowDeleteAlert(false);
  };

  const handleUpdateCustomer = async (customerData: Partial<{ first_name: string; last_name: string; phone?: string }>) => {
    try {
      await updateCustomer(customerData);
      setShowCustomerEditForm(false);
    } catch (err) {
      console.error('Failed to update customer:', err);
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address_1,
      address.address_2,
      address.city,
      address.province,
      address.postal_code,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading && !customer) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Profile</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <IonSpinner />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (showCustomerEditForm && customer) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Edit Customer Information</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <CustomerEditForm
            customer={customer}
            onSave={handleUpdateCustomer}
            onCancel={() => setShowCustomerEditForm(false)}
            isLoading={isLoading}
          />
        </IonContent>
      </IonPage>
    );
  }

  if (showAddressForm) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
              {editingAddress ? 'Edit' : 'Add'} {addressType === 'billing' ? 'Billing' : 'Shipping'} Address
            </IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <AddressForm
            address={editingAddress || undefined}
            onSave={handleSaveAddress}
            onCancel={() => {
              setShowAddressForm(false);
              setEditingAddress(null);
            }}
            title={`${editingAddress ? 'Edit' : 'Add'} ${addressType === 'billing' ? 'Billing' : 'Shipping'} Address`}
            isLoading={isLoading}
          />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={() => fetchCustomer()}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        {error && (
          <IonItem color="danger">
            <IonLabel>{error}</IonLabel>
          </IonItem>
        )}

        {/* Customer Info */}
        {customer && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={person} style={{ marginRight: '8px' }} />
                Customer Information
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem lines="none">
                <IonLabel>
                  <h2>{customer.first_name} {customer.last_name}</h2>
                  <p>{customer.email}</p>
                  {customer.phone && <p>{customer.phone}</p>}
                  {customer.company_name && <p>{customer.company_name}</p>}
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  onClick={() => setShowCustomerEditForm(true)}
                >
                  <IonIcon icon={create} slot="start" />
                  Edit
                </IonButton>
              </IonItem>
            </IonCardContent>
          </IonCard>
        )}

        {/* Shipping Addresses */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Shipping Addresses</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {customer?.shipping_addresses && customer.shipping_addresses.filter(addr => !addr.is_default_billing).length > 0 ? (
              <IonList>
                {customer.shipping_addresses
                  .filter(addr => !addr.is_default_billing)
                  .sort((a, b) => {
                    // Sort by ID to maintain consistent order regardless of default status
                    return (a.id || '').localeCompare(b.id || '');
                  })
                  .map((address) => (
                  <IonItem key={`shipping-${address.id}`}>
                    <IonLabel>
                      <h3>
                        {address.first_name} {address.last_name}
                        {address.is_default_shipping && <IonText color="success"> (Default Shipping)</IonText>}
                      </h3>
                      <p>{formatAddress(address)}</p>
                      {address.phone && <p>{address.phone}</p>}
                      
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <IonButton
                          size="small"
                          fill={address.is_default_shipping ? "solid" : "outline"}
                          color="success"
                          onClick={() => setDefaultShippingAddress(address.id!)}
                          disabled={address.is_default_shipping}
                        >
                          {address.is_default_shipping ? 'Default Shipping' : 'Set as Shipping'}
                        </IonButton>
                      </div>
                    </IonLabel>
                    <IonButtons slot="end">
                      <IonButton
                        fill="clear"
                        onClick={() => handleEditAddress(address, 'shipping')}
                      >
                        <IonIcon icon={create} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => handleDeleteAddress(address.id!)}
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <IonItem>
                <IonLabel>
                  <IonText color="medium">No shipping addresses</IonText>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  onClick={() => handleAddAddress('shipping')}
                >
                  Add Address
                </IonButton>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>

        {/* Billing Addresses */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Billing Addresses</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {customer?.shipping_addresses && customer.shipping_addresses.filter(addr => addr.is_default_billing).length > 0 ? (
              <IonList>
                {customer.shipping_addresses
                  .filter(addr => addr.is_default_billing)
                  .sort((a, b) => {
                    // Sort by ID to maintain consistent order
                    return (a.id || '').localeCompare(b.id || '');
                  })
                  .map((address) => (
                  <IonItem key={`billing-${address.id}`}>
                    <IonLabel>
                      <h3>
                        {address.first_name} {address.last_name}
                        <IonText color="primary"> (Billing Address)</IonText>
                      </h3>
                      <p>{formatAddress(address)}</p>
                      {address.phone && <p>{address.phone}</p>}
                      
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <IonButton
                          size="small"
                          fill="solid"
                          color="primary"
                          disabled
                        >
                          Default Billing
                        </IonButton>
                      </div>
                    </IonLabel>
                    <IonButtons slot="end">
                      <IonButton
                        fill="clear"
                        onClick={() => handleEditAddress(address, 'billing')}
                      >
                        <IonIcon icon={create} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => handleDeleteAddress(address.id!)}
                      >
                        <IonIcon icon={trash} />
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <IonItem>
                <IonLabel>
                  <IonText color="medium">No billing addresses</IonText>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  onClick={() => handleAddAddress('billing')}
                >
                  Add Address
                </IonButton>
              </IonItem>
            )}
          </IonCardContent>
        </IonCard>

        {/* Add Shipping Address FAB */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => handleAddAddress('shipping')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Address"
          message="Are you sure you want to delete this address?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: confirmDeleteAddress,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab2;