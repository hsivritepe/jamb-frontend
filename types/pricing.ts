export interface PricingFeature {
    id: number;
    text: string;
}

export interface PricingPlan {
    id: number;
    name: string;
    price: number;
    description: string;
    features: PricingFeature[];
    isPopular?: boolean;
}
