import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonLoading,
    IonText,
    IonChip,
    IonSpinner,
} from "@ionic/react";
import { useProduct } from "medusa-react";
import { useParams } from "react-router-dom";
import { useRegionContext } from "../contexts/RegionContext";
import AddToCart from "../components/AddToCart";
import CartIcon from "../components/CartIcon";
import CartModal from "../components/CartModal";
import { MedusaProduct, MedusaProductVariant } from "../interfaces/medusa";
import "./ProductDetailsPage.css";

interface ProductDetailsParams {
    id: string;
}

const ProductDetailsPage: React.FC = () => {
    console.log('🔍 ProductDetailsPage: Component rendering started');
    
    const { id } = useParams<ProductDetailsParams>();
    console.log('🔍 ProductDetailsPage: Product ID from params:', id);
    
    const { selectedRegion } = useRegionContext();
    console.log('🔍 ProductDetailsPage: Selected region:', selectedRegion);
    
    const { product, isLoading, isError } = useProduct(id, {
        region_id: selectedRegion?.id,
        fields: "*variants.calculated_price",
        enabled: !!selectedRegion,
    }) as { product: MedusaProduct | undefined, isLoading: boolean, isError: boolean };
    
    console.log('🔍 ProductDetailsPage: useProduct hook result:', {
        product: !!product,
        isLoading,
        isError,
        productId: product?.id,
        productTitle: product?.title
    });

    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    
    console.log('🔍 ProductDetailsPage: Component state:', {
        imageLoading,
        imageError,
        isCartModalOpen
    });

    useEffect(() => {
        console.log('🔍 ProductDetailsPage: useEffect triggered for thumbnail:', product?.thumbnail);
        if (product?.thumbnail) {
            setImageLoading(true);
            setImageError(false);
        }
    }, [product?.thumbnail]);
    
    console.log('🔍 ProductDetailsPage: About to render, checking conditions...');
    console.log('🔍 ProductDetailsPage: isLoading =', isLoading);
    console.log('🔍 ProductDetailsPage: isError =', isError);
    console.log('🔍 ProductDetailsPage: product exists =', !!product);

    if (isLoading) {
        console.log('🔍 ProductDetailsPage: Rendering loading state');
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/tabs/tab1" />
                        </IonButtons>
                        <IonTitle>Loading...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <IonSpinner />
                        <IonText style={{ marginLeft: '1rem' }}>Loading product details...</IonText>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (isError || !product) {
        console.log('🔍 ProductDetailsPage: Rendering error state');
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonBackButton defaultHref="/tabs/tab1" />
                        </IonButtons>
                        <IonTitle>Product Not Found</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonCard>
                        <IonCardContent>
                            <IonText color="danger">
                                <h2>Product Not Found</h2>
                                <p>The product you're looking for could not be loaded.</p>
                                <p>Product ID: {id}</p>
                                <p>Region: {selectedRegion?.name || 'No region selected'}</p>
                            </IonText>
                        </IonCardContent>
                    </IonCard>
                </IonContent>
            </IonPage>
        );
    }
    
    console.log('🔍 ProductDetailsPage: Rendering main product view');
    console.log('🔍 ProductDetailsPage: Product data:', {
        id: product.id,
        title: product.title,
        hasDescription: !!product.description,
        hasThumbnail: !!product.thumbnail,
        variantsCount: product.variants?.length || 0,
        tagsCount: product.tags?.length || 0
    });

    return (
        <IonPage>
            {console.log('🔍 ProductDetailsPage: Starting main render')}
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/tabs/tab1" />
                    </IonButtons>
                    <IonTitle>{product.title}</IonTitle>
                    <IonButtons slot="end">
                        <CartIcon onClick={() => setIsCartModalOpen(true)} />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="ion-padding">
                {console.log('🔍 ProductDetailsPage: Rendering content')}
                {selectedRegion && (
                    <IonItem lines="none">
                        <IonLabel>
                            <p>Prices shown in {selectedRegion.name} ({selectedRegion.currency_code.toUpperCase()})</p>
                        </IonLabel>
                    </IonItem>
                )}
                <div className="product-details-container">
                    {console.log('🔍 ProductDetailsPage: Rendering product card')}
                    <IonCard>
                        {product.thumbnail && (
                            <>
                                {console.log('🔍 ProductDetailsPage: Rendering thumbnail:', product.thumbnail)}
                            <div className="image-container">
                                {imageLoading && !imageError && (
                                    <div className="image-loading">
                                        <IonSpinner name="crescent" />
                                        <IonText>
                                            <p>Loading image...</p>
                                        </IonText>
                                    </div>
                                )}
                                {imageError && (
                                    <div className="image-error">
                                        <IonText>
                                            <p>Failed to load image</p>
                                        </IonText>
                                    </div>
                                )}
                                <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                        onLoad={() => {
                                            console.log('🔍 ProductDetailsPage: Image loaded successfully');
                                            setImageLoading(false);
                                        }}
                                    onError={() => {
                                            console.log('🔍 ProductDetailsPage: Image failed to load');
                                        setImageLoading(false);
                                        setImageError(true);
                                    }}
                                    style={{
                                        display: imageLoading || imageError ? 'none' : 'block',
                                        maxHeight: '300px',
                                        width: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                            </>
                        )}
                        <IonCardHeader>
                            {console.log('🔍 ProductDetailsPage: Rendering card header')}
                            <IonCardTitle>{product.title}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {console.log('🔍 ProductDetailsPage: Rendering card content')}
                            {product.description && (
                                <>
                                    {console.log('🔍 ProductDetailsPage: Rendering description')}
                                <IonText>
                                    <p>{product.description}</p>
                                </IonText>
                            )}

                            {product.variants && product.variants.length > 0 && (
                                <div className="variants-section">
                                    <IonText>
                                        <h3>Variants</h3>
                                    </IonText>
                                    {product.variants.map((variant: MedusaProductVariant) => {
                                        const price = variant.calculated_price;
                                        return (
                                            <IonItem key={variant.id}>
                                                <IonLabel>
                                                    <h3>{variant.title}</h3>
                                                    {price && (
                                </>
                                                        <p>
                                                            {new Intl.NumberFormat(undefined, {
                                                                style: "currency",
                                <>
                                    {console.log('🔍 ProductDetailsPage: Rendering variants, count:', product.variants.length)}
                                                                currency: price.currency_code,
                                                            }).format(price.calculated_amount)}
                                                        </p>
                                                    )}
                                                    {!price && selectedRegion && (
                                            console.log(`🔍 ProductDetailsPage: Rendering variant ${index}:`, variant.id, variant.title);
                                                        <p>Price not available for {selectedRegion.name}</p>
                                                    )}
                                                </IonLabel>
                                            </IonItem>
                                        );
                                    })}
                                </div>
                            )}

                            {product.tags && product.tags.length > 0 && (
                                <div className="tags-section">
                                    <IonText>
                                        <h3>Tags</h3>
                                    </IonText>
                                    <div className="tags-container">
                                        {product.tags.map((tag: { id: string, value: string }) => (
                                            <IonChip key={tag.id} color="primary">
                                                <IonLabel>{tag.value}</IonLabel>
                                            </IonChip>
                                        ))}
                                    </div>
                                </>
                                </div>
                            )}

                            {product.variants && product.variants.length > 0 && (
                                <>
                                    {console.log('🔍 ProductDetailsPage: Rendering tags, count:', product.tags.length)}
                                <div className="add-to-cart-section">
                                    <IonText>
                                        <h3>Add to Cart</h3>
                                    </IonText>
                                    <AddToCart variants={product.variants} />
                                </div>
                                </>
                                </>
                            )}
                        </IonCardContent>
                    </IonCard>
                </div>
                {console.log('🔍 ProductDetailsPage: Finished rendering content')}
            </IonContent>
            
            {console.log('🔍 ProductDetailsPage: Rendering CartModal')}
            <CartModal 
                isOpen={isCartModalOpen} 
                onClose={() => setIsCartModalOpen(false)} 
            />
            {console.log('🔍 ProductDetailsPage: Component render complete')}
        </IonPage>
    );
};

export default ProductDetailsPage;
                                <>
                                    {console.log('🔍 ProductDetailsPage: Rendering AddToCart component')}