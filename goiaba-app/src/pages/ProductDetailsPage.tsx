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
import { useState, useEffect } from "react";
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
    const { id } = useParams<ProductDetailsParams>();
    const { selectedRegion } = useRegionContext();
    const { product, isLoading, isError } = useProduct(id, {
        region_id: selectedRegion?.id,
        fields: "*variants.calculated_price",
        enabled: !!selectedRegion,
    }) as { product: MedusaProduct | undefined, isLoading: boolean, isError: boolean };

    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);

    useEffect(() => {
        if (product?.thumbnail) {
            setImageLoading(true);
            setImageError(false);
        }
    }, [product?.thumbnail]);

    if (isLoading) {
        return (
            <IonPage>
                <IonLoading isOpen={true} message={"Loading product details..."} />
            </IonPage>
        );
    }

    if (isError || !product) {
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
                    <IonItem>
                        <IonLabel>Error loading product details</IonLabel>
                    </IonItem>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
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
            <IonContent scrollY={true}>
                {selectedRegion && (
                    <IonItem lines="none" style={{ margin: '0 1rem' }}>
                        <IonLabel>
                            <p>Prices shown in {selectedRegion.name} ({selectedRegion.currency_code.toUpperCase()})</p>
                        </IonLabel>
                    </IonItem>
                )}
                <IonCard>
                    {product.thumbnail && (
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
                                onLoad={() => setImageLoading(false)}
                                onError={() => {
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
                    )}
                    <IonCardHeader>
                        <IonCardTitle>{product.title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                        {product.description && (
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
                                                    <p>
                                                        {new Intl.NumberFormat(undefined, {
                                                            style: "currency",
                                                            currency: price.currency_code,
                                                        }).format(price.calculated_amount)}
                                                    </p>
                                                )}
                                                {!price && selectedRegion && (
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
                            </div>
                        )}

                        {product.variants && product.variants.length > 0 && (
                            <div className="add-to-cart-section">
                                <IonText>
                                    <h3>Add to Cart</h3>
                                </IonText>
                                <AddToCart variants={product.variants} />
                            </div>
                        )}
                    </IonCardContent>
                </IonCard>
            </IonContent>
            
            <CartModal 
                isOpen={isCartModalOpen} 
                onClose={() => setIsCartModalOpen(false)} 
            />
        </IonPage>
    );
};

export default ProductDetailsPage;
